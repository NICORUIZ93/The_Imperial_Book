# Módulo 17: Consistencia, contratos y operación distribuida

Anotar un método con `@Transactional`, publicar en Kafka y exponer Actuator no demuestra que un microservicio preserve datos bajo fallos. Spring automatiza infraestructura mediante proxies y convenciones; para usarla con rigor debes conocer la frontera exacta de cada garantía. Este módulo convierte supuestos en pruebas de integración e incidentes controlados.


## Aprende construyendo

Cada tema demuestra su garantía (o su ausencia) con un test real que la ejercita bajo condiciones adversas: self-invocation real detectada con `TransactionSynchronizationManager`, una carrera real de dos threads contra una restricción única de base de datos, un contrato verificado con `MockMvc` contra el JSON real de la API, y `TestObservationRegistry` (la utilidad oficial de test de Micrometer Observation) confirmando tags de baja cardinalidad reales.

### Tema 1: `@Transactional` funciona en una frontera, no como encantamiento · Avanzado · 35 min

**Resultado del tema:** observarás en runtime cuándo la llamada cruza el proxy de Spring y cuándo no; luego moverás la operación a otro bean para que el límite transaccional sí se active.

**¿Por qué es importante?** Una anotación no protege el trabajo si la llamada evita el proxy. En una operación de pedidos, esa diferencia puede decidir si un error revierte o deja datos a medias.

**Necesitas:** Java 25 y Maven. Abre [`examples/spring-boot-transaction-boundary-rutaflow/`](https://github.com/NICORUIZ93/The_Imperial_Book/tree/main/examples/spring-boot-transaction-boundary-rutaflow). La prueba usa `TransactionSynchronizationManager`, no mocks.

#### Subtema 1.1: Detecta la transacción al entrar por el proxy · 8 min

**1. Contexto**

Spring aplica `@Transactional` con un interceptor que envuelve el bean. La llamada desde otro bean atraviesa ese límite.

**2. Hazlo tú**

Abre `src/main/java/academia/rutaflow/transacciones/FronteraTransaccionalService.java` y encuentra `transaccionIniciadaPorElProxy()`. Corre:

```bash
./scripts/verify-transactions.sh
```

**Resultado esperado:** el test `llamadaQueEntraPorElProxyAbreUnaTransaccionReal` devuelve `true`.

**Fallo deliberado:** quita `@Transactional` del método y vuelve a correr el script. **Diagnóstico:** el test recibe `false`; no hay transacción activa. Restaura la anotación.

**3. Entiende**

`TransactionSynchronizationManager.isActualTransactionActive()` inspecciona el thread que ejecuta el método. Este test levanta Spring con JPA y H2; no infiere la transacción por la presencia de la anotación.

**4. Cierra**

Explica por dónde entra la llamada y qué valor demuestra que el interceptor abrió una transacción.

#### Subtema 1.2: Observa una llamada interna con `this` · 8 min

**1. Contexto**

Una llamada del método a otro método del mismo objeto no vuelve a pasar por el proxy.

**2. Hazlo tú**

En `FronteraTransaccionalService.java`, sigue `llamadaInternaConThis()` hasta `metodoInternoAnotado()`. Ejecuta `./scripts/verify-transactions.sh`.

```java
public boolean llamadaInternaConThis() {
    return metodoInternoAnotado();
}
```

**Resultado esperado:** `thisNoVuelveAEntrarPorElProxy` recibe `false`, aunque el método interno tenga `@Transactional`.

**Fallo deliberado:** cambia la llamada para que use `trabajo.ejecutar()` en vez del método interno. **Diagnóstico:** ahora cruza otro bean y devuelve `true`, por eso falla la prueba que espera `false`. Restaura la llamada interna.

**3. Entiende**

El método no entra otra vez al proxy; por eso la anotación del método interno no comienza la transacción. Es el modo proxy de Spring, no una regla especial del lenguaje Java.

**4. Cierra**

Dibuja las dos llamadas: controller/otro bean → proxy y `this.metodo()` dentro del objeto.

#### Subtema 1.3: Corrige el límite extrayendo otro bean · 10 min

**1. Contexto**

Si necesitas una nueva frontera, separa el trabajo transaccional en un bean que Spring pueda envolver.

**2. Hazlo tú**

Abre `src/main/java/academia/rutaflow/transacciones/TrabajoTransaccional.java` y compáralo con `FronteraTransaccionalService.llamadaEntreBeans()`:

```java
@Service
public class TrabajoTransaccional {
    @Transactional
    public boolean ejecutar() {
        return TransactionSynchronizationManager.isActualTransactionActive();
    }
}
```

Ejecuta `./scripts/verify-transactions.sh`.

**Resultado esperado:** `llamarOtroBeanSiCruzaElProxy` devuelve `true`; las tres pruebas pasan.

**Fallo deliberado:** quita `@Transactional` de `TrabajoTransaccional.ejecutar()` y corre el script. **Diagnóstico:** la prueba recibe `false` porque ya no hay anotación que el proxy pueda aplicar en ese bean. Restaura la anotación.

**3. Entiende**

El proxy intercepta una llamada entre beans administrados por Spring. No hace falta buscar el proxy manualmente ni llamar `AopContext.currentProxy()` para este diseño.

**4. Cierra**

Nombra el bean donde vive la operación y la llamada que atraviesa el proxy.

#### Subtema 1.4: Comprueba la frontera antes de añadir escrituras · 8 min

**1. Contexto**

Antes de depender de un rollback, comprueba que la transacción realmente está activa en la ruta que ejecuta el trabajo.

**2. Hazlo tú**

Abre `src/test/java/academia/rutaflow/transacciones/FronteraTransaccionalTest.java`. Compara las aserciones de `true` y `false`; vuelve a ejecutar:

```bash
./scripts/verify-transactions.sh
```

**Resultado esperado:** 3 pruebas pasan y diferencian llamada proxy, self-invocation y llamada a otro bean.

**Fallo deliberado:** cambia la aserción de `thisNoVuelveAEntrarPorElProxy` para esperar `true`. **Diagnóstico:** el test falla porque la llamada interna sigue fuera de la transacción. Restaura `isFalse()`.

**3. Entiende**

Estas pruebas demuestran el estado transaccional, no la persistencia de una fila ni las reglas de rollback para excepciones. Añade esos casos solo después de confirmar la frontera.

**4. Cierra**

Entrega el resultado de las tres pruebas y explica por qué `@Transactional` no es un encantamiento que funciona en cualquier llamada.

**Fuentes:** [Spring Framework: gestión de transacciones declarativa](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html) y [modo proxy y self-invocation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html).

---


**Aplicación y decisión:** Práctica del proyecto integrador: mueve la anotación transaccional a un método privado y demuestra qué escritura parcial aparece; restaura la frontera pública del servicio. Una transacción SQL no incluye una llamada HTTP ni un evento Kafka.

Desde `examples/spring-boot-transaction-boundary-rutaflow`, ejecuta la comprobación del laboratorio:

```bash
./mvnw -q test
```

### Tema 2: Recuperación implica duplicación segura · Avanzado · 40 min

**Resultado del tema:** probarás que dos solicitudes simultáneas con la misma clave generan una sola fila en PostgreSQL; luego distinguirás idempotencia HTTP de la deduplicación de eventos Kafka.

**¿Por qué es importante?** Un timeout puede ocurrir después de guardar. El cliente reintenta sin saber si su pedido se creó; una clave persistida evita ejecutar el mismo efecto otra vez.

**Necesitas:** Módulo 4 (SQL) y Módulo 10 de Spring Boot (Kafka). Abre [`examples/spring-boot-idempotency-rutaflow/`](https://github.com/NICORUIZ93/The_Imperial_Book/tree/main/examples/spring-boot-idempotency-rutaflow). La prueba de la carrera usa PostgreSQL real en Testcontainers.

#### Subtema 2.1: Deja que la base imponga la clave única · 8 min

**1. Contexto**

Un `find` seguido de `save` tiene una ventana de carrera: dos solicitudes pueden leer “no existe” antes de insertar. La restricción única se evalúa dentro de PostgreSQL.

**2. Hazlo tú**

Abre `src/main/resources/db/migration/V1__create_idempotency_record.sql` y revisa `operation_key ... UNIQUE`. Corre:

```bash
./scripts/verify-idempotency.sh
```

**Resultado esperado:** Flyway crea la tabla con clave única y las dos pruebas pasan.

**Fallo deliberado:** quita `UNIQUE` de la migración y ejecuta el script. **Diagnóstico:** PostgreSQL rechaza `ON CONFLICT (operation_key)` porque no encuentra una restricción única que respalde esa decisión. Restaura `UNIQUE`.

**3. Entiende**

La aplicación no hace una consulta previa para adivinar qué request ganará. PostgreSQL conserva la regla incluso cuando dos threads llegan casi juntos.

**4. Cierra**

Identifica el campo único y el archivo de migración que lo crea.

#### Subtema 2.2: Registra un intento sin lanzar una excepción · 8 min

**1. Contexto**

Capturar una violación de unicidad dentro de una transacción puede dejarla marcada para rollback. PostgreSQL ofrece `ON CONFLICT` para que el duplicado sea un resultado normal de la sentencia.

**2. Hazlo tú**

Abre `src/main/java/academia/rutaflow/idempotency/IdempotencyService.java` y sigue el SQL:

```sql
INSERT INTO idempotency_record (operation_key)
VALUES (?)
ON CONFLICT (operation_key) DO NOTHING
```

El método devuelve `true` si insertó una fila y `false` si la clave ya estaba. Ejecuta `./scripts/verify-idempotency.sh`.

**Resultado esperado:** la tabla contiene una fila por clave procesada; una clave repetida no añade otra.

**Fallo deliberado:** cambia `DO NOTHING` por `DO UPDATE SET operation_key = EXCLUDED.operation_key`. **Diagnóstico:** PostgreSQL reporta una fila afectada también al actualizar; las dos llamadas pueden devolver `true` y la prueba de concurrencia falla. Restaura `DO NOTHING`.

**3. Entiende**

El resultado numérico de `JdbcTemplate.update` viene de PostgreSQL. El método es transaccional y no convierte una excepción de SQL en un supuesto “duplicado normal”.

**4. Cierra**

Explica qué significa `inserted == 1` y por qué es más seguro que consultar primero y luego insertar.

#### Subtema 2.3: Fuerza una carrera entre dos solicitudes · 10 min

**1. Contexto**

Dos llamadas en serie no demuestran qué ocurre cuando llegan al mismo tiempo. El test las suelta desde una barrera compartida para competir por la misma clave.

**2. Hazlo tú**

Abre `src/test/java/academia/rutaflow/idempotency/IdempotencyRaceTest.java`. Busca `CountDownLatch`, el pool de dos threads y la aserción XOR. Ejecuta:

```bash
./scripts/verify-idempotency.sh
```

**Resultado esperado:** la carrera deja exactamente una respuesta `true`, una `false` y una fila en PostgreSQL.

**Fallo deliberado:** aplica el cambio del subtema anterior y corre el test otra vez. **Diagnóstico:** las dos sentencias cuentan una fila afectada y falla `first ^ second`; la prueba detecta que ambas llamadas se adjudicaron el mismo pedido.

**3. Entiende**

La barrera coordina el comienzo, pero no decide el ganador. El resultado pertenece a la restricción única del servidor de base de datos.

**4. Cierra**

Entrega el informe de las dos pruebas y di qué componente decidió quién registró la clave.

#### Subtema 2.4: Separa reintentos HTTP de reenvíos Kafka · 10 min

**1. Contexto**

La clave de una solicitud entrante y el identificador de un evento cumplen funciones relacionadas, pero pertenecen a fronteras distintas. El outbox conserva el evento con el cambio SQL; el inbox evita repetir su efecto al recibir un evento duplicado.

**2. Hazlo tú**

Abre `examples/spring-kafka-rutaflow/src/main/java/academia/rutaflow/inbox/InboxProcessor.java` y las pruebas `inboxHaceIdempotenteElEfectoDeNegocio` y `replayTrasFallarLaMarcaDespuesDelAckConservaUnaSolaProyeccion` en `EnvioEventPublisherTest.java`. Desde el laboratorio Kafka ejecuta:

```bash
./mvnw test
```

**Resultado esperado:** la suite del lab Kafka pasa sus diez pruebas; una repetición del mismo `eventId` deja una sola proyección. Ese lab usa Kafka embebido y H2, no PostgreSQL.

**Fallo deliberado:** quita del inbox la escritura de `evento_procesado` y ejecuta la suite. **Diagnóstico:** el mismo `eventId` puede aplicar de nuevo el efecto; las pruebas de deduplicación o replay fallan. Restaura el registro idempotente.

**3. Entiende**

Outbox permite reintentar publicación (at-least-once); inbox deduplica el efecto en el consumidor. No significa una transacción única entre PostgreSQL y Kafka ni entrega universal “exactamente una vez”. El lab Kafka explica que H2 y el dispatcher didáctico no prueban despliegue multi-instancia.

**4. Cierra**

Dibuja ambas claves: HTTP `operation_key` para repetir una solicitud; Kafka `eventId` para reconocer un evento recibido otra vez. Indica qué prueba respalda cada límite.

**Límite del laboratorio:** la tabla demuestra unicidad, no implementa una API idempotente completa. En producción, asocia la clave al principal y a la operación, compara un hash del request y conserva la respuesta original con una política de retención.

**Fuentes:** [Spring JDBC con PostgreSQL](https://docs.spring.io/spring-framework/reference/data-access/jdbc.html), [PostgreSQL: INSERT y ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html), [Testcontainers PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/) y [`./examples/spring-kafka-rutaflow/README.md`](https://github.com/NICORUIZ93/The_Imperial_Book/blob/main/examples/spring-kafka-rutaflow/README.md).

---


**Aplicación y decisión:** En el proyecto integrador, conserva operation_key para repetir HTTP y eventId para deduplicar consumo; son contratos de fronteras distintas. No declares exactamente una vez a partir de una tabla con clave única sin revisar el efecto externo.

### Tema 3: Contratos ejecutables protegen despliegues independientes · Avanzado · 35 min

**¿Por qué es importante?** El contrato es lo que el consumidor recibe por HTTP: status, headers y JSON; una discrepancia puede romper apps móviles que se actualizan después del backend. El laboratorio real vive en `examples/spring-boot-integrador-rutaflow/`; sus pruebas usan Spring, seguridad y PostgreSQL con Testcontainers. **Requisito:** Docker debe estar iniciado para ejecutar esa suite.

#### Subtema 3.1: Lee la respuesta que recibe la app · 8 min

**Contexto:** Un cambio puede compilar en el servidor y romper la app móvil. Primero identifica qué cruza la red.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/integrador/entrega/EntregaController.java` y `EntregaResponse.java`. Anota método y ruta, status exitoso, encabezado de ubicación y campos JSON. Mira `postRecorreHttpCapasFlywayYPostgres` en `src/test/java/academia/rutaflow/integrador/entrega/ArquitecturaIntegradaTest.java`.

```bash
cd examples/spring-boot-integrador-rutaflow
./mvnw -q test -Dtest=ArquitecturaIntegradaTest#postRecorreHttpCapasFlywayYPostgres
```

**Resultado esperado:** La prueba recibe `201`, un `Location` con `/api/entregas/<id>` y JSON con `destinatario` y `estado`.

**Fallo deliberado:** Cambia temporalmente `ResponseEntity.created(ubicacion)` a `ResponseEntity.ok()`. **Diagnóstico:** La prueba espera `201` y debe fallar con `200`. Restaura `created`.

**Entiende:** El contrato contiene lo que necesita el cliente, no las clases privadas que el servidor usa para guardar datos.

**Cierra:** Sin mirar el código, enumera ruta, status, header y campos de respuesta.

#### Subtema 3.2: Fija nombres y valores que usa el cliente · 8 min

**Contexto:** Un cliente puede depender del texto exacto `CREADA` o del campo `destinatario`; lo que viaja por JSON define el contrato.

**Hazlo tú:** Ejecuta `contratoDeCreacionConservaStatusLocationYCamposPublicos` en `ArquitecturaIntegradaTest`. Verifica status `201`, `Location`, `id`, `destinatario` y `estado`.

```bash
./mvnw -q test -Dtest=ArquitecturaIntegradaTest#contratoDeCreacionConservaStatusLocationYCamposPublicos
```

**Resultado esperado:** El test comprueba el JSON que produce Spring MVC y PostgreSQL, no un ejemplo JSON escrito aparte.

**Fallo deliberado:** En `EntregaResponse.java`, renombra temporalmente `destinatario` a `cliente`; repite el test. **Diagnóstico:** Debe fallar porque falta `$.destinatario`. Restaura el nombre y vuelve a ejecutarlo.

**Entiende:** Renombrar un campo es incompatible aunque Java compile. Añadir un campo opcional suele ser más compatible; añadir un valor enum puede romper clientes que solo manejan valores conocidos.

**Cierra:** Di qué cambió y qué expectativa del test lo detectó.

#### Subtema 3.3: Comprueba el error que ve el consumidor · 8 min

**Contexto:** Los errores también forman parte del contrato. El cliente necesita distinguir una solicitud inválida de una caída del servidor.

**Hazlo tú:** Ejecuta `contratoDeErrorRechazaDestinatarioVacioSinGuardar`. Sigue `@NotBlank` en `CrearEntregaRequest.java` hasta el status `400`.

```bash
./mvnw -q test -Dtest=ArquitecturaIntegradaTest#contratoDeErrorRechazaDestinatarioVacioSinGuardar
```

**Resultado esperado:** La API devuelve `400 Bad Request` y no crea otra entrega. El proyecto todavía no fija un esquema JSON de error; no supongas que devuelve Problem Details.

**Fallo deliberado:** Quita temporalmente `@NotBlank` y repite el test. **Diagnóstico:** El destinatario de espacios deja de rechazarse; la prueba debe fallar. Restaura la anotación.

**Entiende:** RFC 9457 define un formato estándar de error HTTP, pero citarlo no lo activa. Si se adopta, fija sus campos y media type con una prueba.

**Cierra:** Anota qué garantiza la prueba y qué no garantiza sobre el cuerpo de error.

#### Subtema 3.4: Protege cambios entre despliegues · 10 min

**Contexto:** El backend y la app móvil se actualizan por separado. Conserva lo que los clientes vigentes ya entienden.

**Hazlo tú:** En `EntregaResponse`, añade temporalmente `String nota` y actualiza las llamadas a su constructor (incluido su factory) para pasar `null` al nuevo componente; el compilador exige la nueva aridad del record. Después ejecuta las pruebas de contrato. Restaura el DTO. En `docs/salida-a-produccion.md`, registra cambios de nombres, tipos, valores o significado antes de desplegarlos.

```bash
./mvnw -q test -Dtest=ArquitecturaIntegradaTest
```

**Resultado esperado:** Las pruebas de respuesta, autenticación, validación y configuración pasan. Que siga pasando un test aditivo no prueba que todo cliente externo acepte campos desconocidos.

**Fallo deliberado y diagnóstico:** Renombra un campo en una rama de práctica, guarda la salida roja y revierte el cambio; confirma la salida verde.

**Entiende:** OpenAPI describe rutas y esquemas; las pruebas ejecutables comprueban comportamiento. Para equipos que despliegan en momentos distintos, estudia Spring Cloud Contract y verifica stubs en proveedor y consumidor.

**Cierra:** Conserva una ejecución verde y un fallo deliberado restaurado. La cobertura estructural no prueba compatibilidad de todos los consumidores.

**Fuentes:** [Spring MVC Test](https://docs.spring.io/spring-framework/reference/testing/mockmvc.html), [Spring Cloud Contract](https://docs.spring.io/spring-cloud-contract/reference/), [RFC 9457: Problem Details](https://www.rfc-editor.org/rfc/rfc9457).

---


**Aplicación y decisión:** En el proyecto integrador, guarda status, Location y campos públicos como contrato del cliente. Límite: el test no certifica compatibilidad de todas las versiones móviles; cualquier cambio de significado exige revisión del consumidor.

### Tema 4: Observabilidad sirve a un objetivo y a una decisión · Avanzado · 40 min

**¿Por qué es importante?** Si una solicitud pasa por varios servicios, un error aislado no dice dónde se perdió ni cuánto afecta al usuario. El laboratorio `examples/spring-tracing-rutaflow/` enlaza una petición HTTP con dos servicios y Jaeger.

#### Subtema 4.1: Instrumenta el trabajo de negocio · 8 min

**Contexto:** Spring registra automáticamente parte del tráfico; una observación propia debe señalar una operación que ayude a contestar una pregunta.

**Hazlo tú:** En `src/main/java/academia/rutaflow/tracing/DeliveryController.java`, sigue el bloque que envuelve la llamada al inventario:

```java
Observation.createNotStarted("rutaflow.delivery.prepare", observations)
    .lowCardinalityKeyValue("operation", "reserve-inventory")
    .highCardinalityKeyValue("pedidoId", "RF-314")
    .observe(() -> inventory.get().uri("/inventory/RF-314")
        .retrieve().body(InventoryResponse.class));
```

Empaqueta el proyecto para revisar que el ejemplo compila:

```bash
cd examples/spring-tracing-rutaflow
./mvnw -q package -DskipTests
```

**Resultado esperado:** Maven crea el JAR del servicio sin ejecutar el flujo. La observación de negocio se llama `rutaflow.delivery.prepare` y etiqueta una operación fija.

**Fallo deliberado:** Cambia el nombre de observación por `rutaflow.test.prepare`. **Diagnóstico:** Revisa el cambio en el código y restaura el nombre; el empaquetado por sí solo no prueba que Jaeger recibió una traza.

**Entiende:** Una observación marca trabajo y contexto. La evidencia de que se exportó se obtiene del backend de trazas, no de que el proyecto compile.

**Cierra:** Explica qué trabajo mide ese nombre y qué pregunta respondería durante un incidente.

#### Subtema 4.2: Sigue una solicitud entre servicios · 10 min

**Contexto:** La app de Entregas llama a Inventario por HTTP. El trace ID permite encontrar ambos spans como parte del mismo recorrido.

**Hazlo tú:** Con Docker Compose o Podman Compose disponible, desde `examples/spring-tracing-rutaflow/` ejecuta:

```bash
./scripts/verify-trace.sh
```

**Resultado esperado:** El script consulta `GET /deliveries/RF-314`, muestra la respuesta con inventario reservado y encuentra una traza con los servicios `entregas` e `inventario`. Guarda el trace ID que imprime.

**Fallo deliberado:** En `DeliveryController.java`, cambia `/inventory/RF-314` por `/inventories/RF-314` y repite el script. **Diagnóstico:** Falla la respuesta esperada porque Inventario no tiene esa ruta. Restaura `/inventory/RF-314`.

**Entiende:** La llamada fallida ayuda a ubicar qué frontera revisar. La traza no corrige el error: aporta el recorrido para diagnosticarlo.

**Cierra:** Indica qué servicio inició la petición y cuál debía reservar inventario.

#### Subtema 4.3: Mantén las etiquetas de métricas acotadas · 8 min

**Contexto:** Cada combinación distinta de etiquetas métricas puede crear una serie nueva. Los IDs de pedido cambian casi en cada solicitud.

**Hazlo tú:** En `DeliveryController.java`, compara la etiqueta fija `operation` con `pedidoId`, que cambia por entrega:

```java
.lowCardinalityKeyValue("operation", "reserve-inventory")
.highCardinalityKeyValue("pedidoId", "RF-314")
```

**Resultado esperado:** `operation` puede etiquetar métricas y trazas; `pedidoId` se conserva para buscar la traza, pero Micrometer no lo convierte en tag métrico. Spring Boot envía etiquetas de alta cardinalidad solo a trazas.

**Fallo deliberado:** Cambia temporalmente `highCardinalityKeyValue` por `lowCardinalityKeyValue` para `pedidoId`. **Diagnóstico:** Explica por qué muchos IDs pueden multiplicar las series de métricas. Restaura `highCardinalityKeyValue`.

**Entiende:** El trace ID agrupa spans del recorrido; `pedidoId` es contexto de negocio. Los dos ayudan a investigar, pero no son tags métricos.

**Cierra:** Clasifica `operation`, `pedidoId` y `traceId`; justifica qué sistema debería recibir cada uno.

#### Subtema 4.4: Convierte la señal en una decisión · 10 min

**Contexto:** Una pantalla llena de gráficas no indica qué debe hacer el equipo. Elige una medida que describa una experiencia que importe.

**Hazlo tú:** Completa este objetivo para el flujo de entregas: “Al menos ___ % de las confirmaciones terminan en menos de ___ ms durante ___ días”. Señala qué dato permitiría calcularlo y qué acción tomarías al incumplirlo.


Para comprobar «Convierte la señal en una decisión», consulta: `examples/spring-tracing-rutaflow/src/main/java/academia/rutaflow/tracing/DeliveryController.java`. Desde `examples/spring-tracing-rutaflow` repite la comprobación:

```bash
bash ./scripts/verify-trace.sh
```

**Resultado esperado:** El SLI mide una proporción y una latencia; el SLO añade objetivo y ventana. Una traza aislada explica una solicitud, pero no calcula por sí sola el porcentaje de todas las solicitudes.

**Fallo deliberado:** Usa como alerta “hay un span con error”. **Diagnóstico:** Explica por qué una solicitud fallida no revela si el servicio incumplió el objetivo para sus usuarios. Sustitúyelo por una medida de proporción/latencia y una acción concreta.

**Entiende:** Métricas muestran tendencias agregadas; trazas ayudan a inspeccionar recorridos individuales. No uses liveness para reiniciar el proceso cada vez que una dependencia externa deja de responder.

**Cierra:** Guarda el objetivo, su ventana y la primera acción operativa. La ejecución Jaeger sigue pendiente si no tienes Docker o Podman disponible.

**Fuentes:** [Micrometer Observation](https://docs.micrometer.io/micrometer/reference/observation.html), [Spring Boot observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html) y [OpenTelemetry: conceptos de señales](https://opentelemetry.io/docs/concepts/signals/).

---


**Aplicación y decisión:** En el proyecto integrador, usa el trace ID para localizar la llamada lenta y relaciona esa señal con un objetivo de servicio. Límite: ver dos spans no acredita observabilidad completa ni protección de todos los datos registrados.

### Tema 5: Saga con compensación real · Avanzado · 35 min

#### Subtema 5.1: Dibuja los pasos del pedido · 8 min

**Contexto:** Una compra puede necesitar reservar inventario, cobrar y confirmar el envío. Cada paso cambia un estado distinto y no existe un botón universal de deshacer para todos.

**¿Por qué es importante?** Si un paso posterior falla, dejar activos los cambios anteriores puede producir cobros sin envío o inventario bloqueado. La compensación da una acción explícita para esos efectos parciales.

**Hazlo tú:** Abre `examples/spring-saga-rutaflow/README.md` y revisa el recorrido antes de abrir el código:

```text
┌────────────────────┐  ┌──────────────┐  ┌────────────────┐
│ Reservar inventario├─>│ Cobrar pago  ├─>│ Confirmar envío│
└─────────┬──────────┘  └──────┬───────┘  └────────────────┘
          ↑                    ↑
   Liberar reserva       Devolver pago
```


Para comprobar «Dibuja los pasos del pedido», consulta: `examples/spring-saga-rutaflow/src/test/java/academia/rutaflow/saga/OrderSagaTest.java`. Desde `examples/spring-saga-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Si falla el envío, el dinero y la reserva se revierten en orden inverso: primero se devuelve el cobro, luego se libera el inventario.

**Fallo deliberado:** Cambia el dibujo para devolver primero el inventario. **Diagnóstico:** Luego compáralo con la prueba del siguiente subtema y explica por qué el orden inverso mantiene disponibles las dependencias necesarias para deshacer el paso anterior.

**Entiende:** Una compensación es una acción nueva que intenta corregir un efecto previo; no borra el historial ni garantiza que el mundo vuelva exactamente al estado anterior.

**Cierra:** Nombra un efecto que se pueda compensar y otro que quizá no (por ejemplo, una notificación ya leída).

#### Subtema 5.2: Ejecuta y compensa en orden inverso · 8 min

**Contexto:** El orquestador registra una compensación solo después de que termina cada paso. Cuando falla un paso, recorre esas acciones completadas desde la última hacia la primera.

**Hazlo tú:** Abre `examples/spring-saga-rutaflow/src/main/java/academia/rutaflow/saga/OrderSaga.java` y `src/test/java/academia/rutaflow/saga/OrderSagaTest.java`. Ejecuta desde `examples/spring-saga-rutaflow/`:

```bash
./mvnw -q -Dtest=OrderSagaTest#ifShippingFailsItRefundsAndReleasesInReverseOrder test
```

**Resultado esperado:** La prueba fuerza un fallo del envío, comprueba que el pago vuelve y la reserva se libera; el registro contiene `devolver pago` antes de `liberar inventario`.

**Fallo deliberado:** Cambia el recorrido inverso por uno que compense desde la primera acción hasta la última. **Diagnóstico:** Ejecuta la misma prueba: falla porque las acciones observadas ya no están en el orden esperado. Restaura el recorrido inverso y repite el comando.

**Entiende:** Un paso que falla no se añade a la lista de compensaciones completadas. Por eso no se intenta cancelar un envío que nunca se confirmó.

**Cierra:** Dibuja el estado final del inventario y el pago después de la compensación; ambos deben quedar sin efecto para ese pedido.

#### Subtema 5.3: Compara fallo y éxito · 8 min

**Contexto:** Una compensación solo se ejecuta si un paso posterior falla. Si todos terminan bien, los cambios permanecen.

**Hazlo tú:** En `examples/spring-saga-rutaflow/src/test/java/academia/rutaflow/saga/OrderSagaTest.java`, lee `ifAllParticipantsSucceedItKeepsTheOrderEffects` y ejecuta:

```bash
./mvnw -q test
```

**Resultado esperado:** En éxito, la reserva, el cobro y el envío quedan registrados, y no aparecen acciones de compensación. En fallo, la prueba anterior verifica las acciones inversas y el estado restaurado.

**Fallo deliberado:** Mueve la compensación de inventario al camino de éxito en `OrderSaga.place`. **Diagnóstico:** El test del caso exitoso falla porque la reserva desaparece. Restaura la compensación dentro del bloque de fallo.

**Entiende:** Las pruebas inspeccionan el estado de tres participantes en memoria y el orden del registro; eso permite comprobar la regla del ejemplo sin depender de una interpretación del log.

**Cierra:** Explica qué resultado debería guardar tu servicio: pedido confirmado, pedido rechazado o recuperación pendiente.

#### Subtema 5.4: Delimita la demo y planea la recuperación · 8 min

**Contexto:** La saga de este laboratorio corre en una sola JVM con participantes locales. Una caída del proceso borraría el estado y la lista de acciones.

**Hazlo tú:** Revisa el límite al final de `examples/spring-saga-rutaflow/README.md` y compara este orquestador síncrono con el Módulo 17 y el próximo M17 T7.


Para comprobar «Delimita la demo y planea la recuperación», consulta: `examples/spring-saga-rutaflow/src/test/java/academia/rutaflow/saga/OrderSagaTest.java`. Desde `examples/spring-saga-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Puedes señalar qué falta para coordinar microservicios reales: persistir el estado, comunicar comandos/eventos de forma fiable, definir idempotencia y reintentar compensaciones fallidas.

**Fallo deliberado:** Imagina que el cobro fue aceptado por el proveedor, pero la respuesta se perdió antes de que el orquestador lo registrara. **Diagnóstico:** Anota por qué repetir el cobro puede duplicarlo y qué clave o consulta de idempotencia necesitaría la integración.

**Entiende:** Esta implementación demuestra el orden de orquestación y compensación; no es una transacción distribuida ni un sistema durable. Una saga no ofrece aislamiento ACID y puede requerir mecanismos adicionales para evitar estados intermedios visibles.

**Cierra:** **Proyecto integrador:** para el pedido del Módulo 20, enumera los servicios participantes, el estado que cambia cada uno y la acción compensatoria concreta. No copies este almacenamiento en memoria como solución de producción.

**Fuentes:** [Microservices.io — Saga](https://microservices.io/patterns/data/saga.html). La referencia describe tanto coordinación por orquestación como coreografía y destaca que las compensaciones se diseñan explícitamente; este laboratorio solo ejercita la variante orquestada local.

### Tema 6: Event Sourcing con replay real · Avanzado · 35 min

#### Subtema 6.1: Guarda hechos, no solo el estado final · 8 min

**Contexto:** Una tabla que solo dice `CANCELADO` no cuenta cuándo se creó o confirmó el pedido. Event Sourcing conserva los cambios como eventos ordenados y calcula el estado al reproducirlos.

**¿Por qué es importante?** El historial permite reconstruir cómo llegó el pedido a su estado actual y explicar decisiones pasadas. Ese beneficio solo compensa el trabajo adicional si el negocio necesita historial o reconstrucción.

**Hazlo tú:** Abre `examples/spring-eventsourcing-rutaflow/src/main/java/academia/rutaflow/eventsourcing/OrderEvent.java` y `OrderEventStore.java`. Sigue cómo se guarda cada evento en el stream del pedido.

```text
PedidoCreado → PedidoConfirmado → PedidoCancelado
       └──────────── replay ──────────────> CANCELADO
```

Archivo concreto para esta comprobación: `examples/spring-eventsourcing-rutaflow/src/main/java/academia/rutaflow/eventsourcing/OrderEvent.java`.


Para comprobar «Guarda hechos, no solo el estado final», consulta: `examples/spring-eventsourcing-rutaflow/src/test/java/academia/rutaflow/eventsourcing/OrderReplayTest.java`. Desde `examples/spring-eventsourcing-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Hay tres eventos para el pedido, en orden; el evento más reciente no reemplaza los anteriores.

**Fallo deliberado:** Intenta guardar `OrderCancelled` antes de confirmar el pedido usando la prueba `anInvalidEventIsNotAddedToTheStream`. **Diagnóstico:** El store rechaza la transición y conserva solo `OrderCreated`.

**Entiende:** Un evento describe un hecho ya ocurrido. Un comando pide hacer algo; un evento registra que algo pasó.

**Cierra:** Explica qué se perdería si solo guardáramos el último estado `CANCELLED`.

#### Subtema 6.2: Reconstruye el pedido paso a paso · 8 min

**Contexto:** El replay empieza sin pedido y aplica cada evento en el orden guardado; cada paso produce un nuevo estado inmutable.

**Hazlo tú:** Abre `examples/spring-eventsourcing-rutaflow/src/main/java/academia/rutaflow/eventsourcing/OrderState.java`. Lee `replay` y `apply`, luego ejecuta:

```bash
./mvnw -q -Dtest=OrderReplayTest#eventStreamCanRebuildTheCurrentOrderWithoutSavingASnapshot test
```

Ejecuta el comando desde `examples/spring-eventsourcing-rutaflow/`.

**Resultado esperado:** Al volver a leer los tres eventos, el estado coincide con `CANCELLED` y conserva el motivo de cancelación, sin cargar una copia del estado final.

**Fallo deliberado:** En `replayRejectsEventsStoredInAnImpossibleOrder`, mueve `OrderConfirmed` después de `OrderCancelled`. **Diagnóstico:** La prueba falla porque la secuencia ya no genera la transición inválida que espera detectar. Restaura el historial inválido y vuelve a correrla.

**Entiende:** El orden es parte del significado: confirmar un pedido cancelado no equivale a cancelarlo después de confirmar.

**Cierra:** Cuenta en voz alta qué estado produce cada evento de la lista.

#### Subtema 6.3: Rechaza eventos que rompen las reglas · 8 min

**Contexto:** Un replay que acepta cualquier secuencia puede construir estados que nunca debieron existir en el negocio.

**Hazlo tú:** En `examples/spring-eventsourcing-rutaflow/src/main/java/academia/rutaflow/eventsourcing/OrderState.java`, inspecciona las reglas: un pedido debe crearse antes de confirmarse y confirmarse antes de cancelarse. Luego lee `anInvalidEventIsNotAddedToTheStream` en `src/test/java/academia/rutaflow/eventsourcing/OrderReplayTest.java`.

**Resultado esperado:** El intento de cancelar el pedido recién creado lanza `IllegalStateException` y el evento no se añade al stream.

**Fallo deliberado:** Quita la validación de estado previo a `OrderCancelled` y corre `./mvnw -q -Dtest=OrderReplayTest#replayRejectsEventsStoredInAnImpossibleOrder test`. **Diagnóstico:** El replay deja de proteger la regla y la prueba falla. Restaura la validación.

**Entiende:** Los eventos registrados son la fuente de verdad de esta demo; `currentState` es una lectura derivada. En un sistema grande, reconstruir cada vez cuesta más y pueden usarse snapshots como atajo, verificándolos contra el stream.

**Cierra:** Añade una regla de negocio que deba cumplirse antes de guardar un nuevo evento.

#### Subtema 6.4: Delimita el almacenamiento y la reconstrucción · 8 min

**Contexto:** El store del ejemplo vive en memoria; reiniciar el proceso borra el historial. Sirve para estudiar el modelo y no para guardar pedidos reales.

**Hazlo tú:** Revisa `examples/spring-eventsourcing-rutaflow/README.md` y ejecuta toda la suite desde la carpeta del laboratorio:

```bash
./mvnw -q test
```

**Resultado esperado:** Pasan cuatro pruebas: replay con tres eventos, rechazo de orden imposible, stream vacío y rechazo de un evento que no debe añadirse.

**Fallo deliberado:** Cierra el proceso y vuelve a levantarlo. **Diagnóstico:** El stream ya no existe. Anota qué almacenamiento duradero necesitaría un servicio real antes de afirmar que conserva el historial.

**Entiende:** Event Sourcing no es lo mismo que publicar eventos en Kafka ni que guardar un outbox. En producción requiere almacenamiento durable, control de escrituras concurrentes, evolución de versiones y cuidado para no repetir efectos externos durante un replay.

**Cierra:** **Proyecto integrador:** para el envío del Módulo 20, propone eventos inmutables de creación, recogida y entrega; indica qué estado se reconstruye y cómo se guardaría el historial de forma durable. El laboratorio no integra Kafka, base de datos ni proyecciones externas.

**Fuente:** [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html). La fuente describe almacenar los cambios como secuencia y reconstruir el estado desde el log; este laboratorio usa un stream local en memoria, sin persistencia.

### Tema 7: Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar · Experto · 35 min

#### Subtema 7.1: Conserva el trabajo pendiente · 8 min

**Contexto:** Una compensación también puede fallar. Si solo guardamos el error en un log y marcamos la saga como terminada, la acción pendiente puede perderse.

**¿Por qué es importante?** Un pedido puede quedar con el inventario reservado aunque ya se rechazó el pago. Un estado `PENDING` permite saber qué reparación falta después de un reinicio.

**Hazlo tú:** Abre `examples/spring-saga-recovery-rutaflow/src/main/resources/schema.sql` y revisa `compensation_job`. Localiza `PENDING` y `DONE` en `CompensationService.java`.

```text
PENDING ── compensación exitosa ──> DONE
   │
   └── falla la transacción ───────> PENDING
```

Archivo concreto para esta comprobación: `examples/spring-saga-recovery-rutaflow/src/main/java/academia/rutaflow/sagarecovery/CompensationService.java`.


Para comprobar «Conserva el trabajo pendiente», consulta: `examples/spring-saga-recovery-rutaflow/src/test/java/academia/rutaflow/sagarecovery/CompensationRecoveryTest.java`. Desde `examples/spring-saga-recovery-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** La tarea fallida mantiene un ID y puede buscarse para un nuevo intento.

**Fallo deliberado:** Cambia temporalmente el estado inicial insertado en `schedule` de `PENDING` a `DONE`. **Diagnóstico:** Ejecuta la prueba completa: el servicio debe omitir la tarea y el test falla al esperar una liberación.

**Entiende:** `PENDING` significa “queda trabajo”; no es solo un mensaje de error.

**Cierra:** Indica dónde consultaría el equipo el trabajo pendiente tras reiniciar.

#### Subtema 7.2: Confirma juntos el efecto y su estado · 8 min

**Contexto:** Liberar inventario y marcar la compensación deben confirmarse juntos. Si solo ocurre el primero, un reintento podría repetirlo; si solo el segundo, el trabajo se pierde.

**Hazlo tú:** Abre `examples/spring-saga-recovery-rutaflow/src/main/java/academia/rutaflow/sagarecovery/CompensationService.java`. Sigue el `TransactionTemplate`, la lectura `FOR UPDATE` y las escrituras de inventario y estado. Ejecuta desde `examples/spring-saga-recovery-rutaflow/`:

```bash
./mvnw -q -Dtest=CompensationRecoveryTest test
```

El núcleo que mantiene juntas las dos escrituras se ve así:

```java
jdbc.update("UPDATE inventory_reservation SET released = TRUE, release_count = release_count + 1 WHERE id = ?",
    job.reservationId());
jdbc.update("UPDATE compensation_job SET status = 'DONE' WHERE id = ? AND status = 'PENDING'",
    compensationId);
```

**Resultado esperado:** El fallo inyectado después de actualizar el inventario provoca rollback: la reserva sigue sin liberar y la tarea permanece `PENDING`.

**Fallo deliberado:** Después de crear `TransactionTemplate`, agrega temporalmente `transaction.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_NOT_SUPPORTED);`. **Diagnóstico:** Ejecuta el test: la primera escritura queda aplicada cuando ocurre el fallo y se detecta el estado parcial. Quita esa línea y repite el test.

**Entiende:** Este límite es una sola base de datos de un participante. La transacción de Spring no convierte varios microservicios en una transacción global.

**Cierra:** Nombra las dos escrituras que esta transacción debe proteger juntas.

#### Subtema 7.3: Reabre y reintenta sin duplicar · 8 min

**Contexto:** La memoria del proceso desaparece; una tarea guardada en una base de archivo puede sobrevivir a que la aplicación cierre su conexión.

**Hazlo tú:** En `examples/spring-saga-recovery-rutaflow/src/test/java/academia/rutaflow/sagarecovery/CompensationRecoveryTest.java`, sigue el fallo, el cierre del pool, la reapertura del mismo archivo H2 y la nueva instancia del servicio.

Archivo concreto para esta comprobación: `examples/spring-saga-recovery-rutaflow/src/test/java/academia/rutaflow/sagarecovery/CompensationRecoveryTest.java`.


Para comprobar «Reabre y reintenta sin duplicar», consulta: `examples/spring-saga-recovery-rutaflow/src/test/java/academia/rutaflow/sagarecovery/CompensationRecoveryTest.java`. Desde `examples/spring-saga-recovery-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** La nueva instancia lee `PENDING`, completa el trabajo y lo marca `DONE`. Al repetirlo, responde `ALREADY_DONE`; el contador `release_count` sigue en 1.

**Fallo deliberado:** Quita la salida temprana para un trabajo `DONE` y ejecuta el test. **Diagnóstico:** La segunda llamada vuelve a liberar inventario y el contador termina en 2. Restaura la comprobación idempotente.

**Entiende:** El ID estable identifica el mismo trabajo entre reintentos. El bloqueo de fila serializa dos intentos simultáneos sobre esta base local.

**Cierra:** Explica por qué el sistema debe reutilizar el mismo ID al reintentar la misma compensación.

#### Subtema 7.4: Define los límites de recuperación · 8 min

**Contexto:** El ejemplo conserva el trabajo en H2 y una prueba lo vuelve a ejecutar; todavía no hay un trabajador que descubra pendientes ni un plan de reintentos.

**Hazlo tú:** Revisa `examples/spring-saga-recovery-rutaflow/README.md` y corre la suite completa:

```bash
./mvnw -q test
```

**Resultado esperado:** La prueba comprueba fallo después de una escritura, rollback, reapertura de archivo y repetición con un único efecto.

**Fallo deliberado:** En `CompensationRecoveryTest`, cambia `DATABASE_URL` de `jdbc:h2:file:` a `jdbc:h2:mem:`. **Diagnóstico:** Al cerrar el pool, el historial se pierde y el test falla al reabrir la base.

**Entiende:** El ejercicio no implementa un broker, outbox, espera entre reintentos, métricas ni alarmas. El ejemplo usa el ID de compensación como clave estable y una transacción local; no coordina bases distintas.

**Cierra:** **Proyecto integrador:** para el pedido del Módulo 20, define el ID estable, el estado pendiente, la operación idempotente y una alarma para trabajos demasiado antiguos. Decide cómo guardar el outbox si el comando de reintento se publica en Kafka o RabbitMQ.

**Fuentes:** [Spring Framework — Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html), [H2 — Connection Modes and Database URLs](https://h2database.com/html/features.html#database_url), [Microservices.io — Saga](https://microservices.io/patterns/data/saga.html). La transacción aquí solo cubre cambios en la base del participante local.

#### Material Python de referencia RutaFlow · consulta optativa

El tema se estudia por la ruta Java/Spring Boot anterior. Este anexo conserva el
material Python original de RutaFlow para comparar una compensación local con
SQLite. Puedes ejecutarlo desde `examples/rutaflow-material/sagas/` con
`python3 -m unittest test_compensacion.py`.

Archivo: `examples/rutaflow-material/sagas/compensacion.py` (`compensacion.py`):

```python
import sqlite3


def iniciar(db):
    db.executescript('''CREATE TABLE IF NOT EXISTS stock(id TEXT PRIMARY KEY, cantidad INTEGER);
    CREATE TABLE IF NOT EXISTS compensaciones(id TEXT PRIMARY KEY, estado TEXT);
    INSERT OR IGNORE INTO stock VALUES ('reserva-42', 9);
    INSERT OR IGNORE INTO compensaciones VALUES ('liberar-42', 'PENDIENTE');''')


def compensar(db, falla=False):
    estado = db.execute("SELECT estado FROM compensaciones WHERE id='liberar-42'").fetchone()[0]
    if estado == 'HECHA':
        return
    if falla:
        raise ConnectionError('Inventario temporalmente no disponible')
    # El efecto y su marcador son atómicos EN ESTA base local del participante.
    with db:
        db.execute("UPDATE stock SET cantidad=cantidad+1 WHERE id='reserva-42'")
        db.execute("UPDATE compensaciones SET estado='HECHA' WHERE id='liberar-42'")


if __name__ == '__main__':
    with sqlite3.connect('saga.db') as db:
        iniciar(db)
        try:
            compensar(db, falla=True)
        except ConnectionError:
            print('Compensación pendiente; requiere reintento')
        compensar(db)
        compensar(db)
        print('Stock final:', db.execute('SELECT cantidad FROM stock').fetchone()[0])
```

Archivo: `examples/rutaflow-material/sagas/test_compensacion.py` (`test_compensacion.py`):

```python
import sqlite3
import tempfile
from pathlib import Path
import unittest
from compensacion import iniciar, compensar

class CompensacionTest(unittest.TestCase):
    def test_reinicio_y_reintento_no_duplican_efecto(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'saga.db'
            with sqlite3.connect(path) as db:
                iniciar(db)
                with self.assertRaises(ConnectionError): compensar(db, falla=True)
                self.assertEqual('PENDIENTE', db.execute('SELECT estado FROM compensaciones').fetchone()[0])
            with sqlite3.connect(path) as db:
                compensar(db)
                compensar(db)
                self.assertEqual(10, db.execute('SELECT cantidad FROM stock').fetchone()[0])
                self.assertEqual('HECHA', db.execute('SELECT estado FROM compensaciones').fetchone()[0])
if __name__=='__main__':unittest.main()
```

## Laboratorio práctico

### Proyecto: microservicio comprobado bajo fallos

Evoluciona el proyecto 12 mediante una vertical de “crear pedido y proyectar resumen”.

1. Dibuja límites transaccionales y recursos. Escribe invariantes antes de anotar métodos.
2. Crea tests para unchecked, checked, excepción capturada, self-invocation, `REQUIRES_NEW` y conflicto `@Version`.
3. Observa conexiones/locks y prueba deadlock o conflicto de orden controlado; define retry solo para la víctima segura.
4. Implementa `Idempotency-Key` bajo restricción única y transacción. Ejecuta 20 requests paralelos iguales.
5. Guarda pedido y outbox juntos. Mata relay después de publicar/antes de marcar y prueba duplicación segura.
6. Implementa consumer con dedupe transaccional, DLT, replay y reconciliación.
7. Describe OpenAPI/Problem Details y añade contratos de consumidor. Rompe status, campo y enum para demostrar gates.
8. Instrumenta traza HTTP→DB→Kafka→consumer, logs correlacionados y métricas sin alta cardinalidad.
9. Define SLI/SLO. Inyecta latencia, timeout, 503 y lag; ajusta deadlines, breaker, bulkhead y readiness.
10. Ejecuta game day, recupera con runbook y entrega postmortem con timeline y acciones.

**Verificación:** consultas prueban un pedido por clave y un efecto por evento; contratos fallan ante incompatibilidad; una traza conecta todo el flujo; alerta refleja burn rate; reinicios no pierden outbox. CI usa PostgreSQL/Kafka reales efímeros y reproduce escenarios críticos.

**Errores comunes y soluciones**

- `@Transactional` en método private/self-called: mueve boundary a llamada que atraviesa proxy o usa template explícito.
- Capturar excepción y devolver null: propaga semántica y prueba rollback.
- Transacción alrededor de HTTP: persiste intención y coordina asíncronamente.
- `find` antes de idempotencia: usa unicidad y transacción contra carrera.
- Confiar en Kafka EOS para PostgreSQL: declara frontera y usa outbox/dedupe.
- Contrato que copia respuesta entera: conserva expectativas mínimas significativas.
- Tag con ID: usa baja cardinalidad en métricas y contexto protegido en trace/log.
- Liveness consulta todas las dependencias: separa vida de preparación para tráfico.
