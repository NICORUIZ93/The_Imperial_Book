# Módulo 21: Apache Kafka con Spring Boot — eventos, consumidores y recuperación

## Aprende construyendo

Vas a seguir un envío desde una API hasta una proyección de ruteo. Primero entenderás productor, contrato, key, particiones y consumer groups; después provocarás duplicados y errores; al final cerrarás la ventana entre PostgreSQL y Kafka con outbox/inbox.

El laboratorio de referencia está en `examples/spring-kafka-rutaflow/`. A diferencia de los fragmentos aislados de una versión anterior, contiene un proyecto Maven ejecutable, Compose, esquema SQL y pruebas de integración con Kafka embebido y H2. Las pruebas no arrancan el PostgreSQL ni el contenedor Kafka de Compose; el flujo manual sí los requiere.

No se promete “exactly once” entre Kafka y PostgreSQL. El objetivo es entender la entrega al menos una vez, hacer los efectos SQL idempotentes y recuperar fallos sin perder silenciosamente eventos.

### Tema 1: Productor, tópico, key y consumidor · Experto · 1 h 20 min

**Prerrequisito:** Java básico, records, UUID, HTTP y transacciones SQL; JDK 27+, Maven 3.9+ y Docker Compose v2 o Podman Compose. Si aún no conoces `@Transactional`, revisa el módulo anterior del track Spring Boot antes de continuar.

**Al terminar podrás:** seguir un `EnvioCreado` desde el outbox hasta el consumer group `rutaflow-ruteo`, explicar qué orden conserva Kafka y observar la partición, el offset y la key reales.

#### Aprende

Al crear un envío, el servicio de ruteo necesita enterarse sin bloquear la respuesta de la API con una llamada síncrona a otro servicio. El productor publica un evento y cada grupo interesado mantiene su propia posición de lectura.

**¿Por qué es importante?** Elegir la key determina qué eventos comparten partición y orden. Sin observar key, partición y offset, un envío fuera de secuencia puede confundirse con un fallo del negocio. Separar productor y consumidores permite desplegarlos y escalarlos por separado; a cambio, el sistema debe aceptar retrasos, reentregas, cambios de contrato y fallos parciales.

- Un **tópico** es un flujo particionado de registros persistentes.
- Una **key** ayuda al particionador a asignar registros a una partición. Con el particionador predeterminado, la misma key conserva la asignación mientras no cambien las condiciones de particionado; Kafka garantiza orden dentro de una partición, no orden global.
- Un **consumer group** divide las particiones entre sus instancias. Dos grupos distintos leen cada uno el flujo; más instancias que particiones no dan más paralelismo para ese tópico.
- El **offset** es la posición de lectura de un grupo en una partición. No es un acuse universal del efecto SQL que la aplicación produjo.
- Kafka almacena bytes. Spring for Apache Kafka convierte el record Java a JSON en el productor y vuelve a construirlo en el consumidor.

La API del laboratorio guarda primero `envio` y `outbox_event`. El dispatcher publica el evento con `envioId` como key; `RuteoListener` muestra key, partición y offset después del procesamiento. El contrato JSON real es versionado por la aplicación: no hay Schema Registry en este laboratorio.

**Modelo mental:** cada partición es una secuencia ordenada y cada consumer group lleva su propio cursor; el cursor no certifica que un efecto SQL haya ocurrido.

**Analogía:** piensa en una cinta de clasificación con carriles; una key dirige los paquetes del mismo envío al mismo carril. A diferencia de una cinta física, Kafka persiste los registros y cada consumer group conserva su propio offset.

#### Practica

Trabaja sobre el proyecto `examples/spring-kafka-rutaflow/`; no generes otro proyecto Spring Initializr, porque las pruebas y los archivos siguientes ya están conectados entre sí.

**Desde cero:** desde la raíz del repositorio, crea una copia independiente para practicar desde cero y ejecuta las pruebas:

```bash
# Copia ejecutable de referencia; se conserva el original para comparar los cambios.
cp -R examples/spring-kafka-rutaflow ejemplo-kafka-basico
cd ejemplo-kafka-basico
mvn test
docker compose up -d --wait
mvn spring-boot:run
```

Para estudiar el contrato, abre `src/main/java/com/academia/rutaflow/event/EnvioCreado.java` en la copia. Este es su contenido completo:

```java
package com.academia.rutaflow.event;

import java.time.Instant;
import java.util.UUID;

public record EnvioCreado(
        // Identifica una ocurrencia concreta para la deduplicación del consumidor.
        UUID eventId,
        // Identifica el agregado; se usa como key para conservar su orden por partición.
        UUID envioId,
        int version,
        Instant occurredAt,
        String referencia) {
}
```

`eventId` identifica una ocurrencia y sirve para deduplicar; `envioId` identifica el agregado y sirve como key para conservar el orden de sus eventos en una partición. `version` y `occurredAt` son parte del contrato, no una garantía automática de compatibilidad.

En el proyecto, revisa estos archivos antes de ejecutar:

- `src/main/resources/application.yml`: serializers, deserializers, grupo y conexión.
- `src/main/java/com/academia/rutaflow/event/EnvioEventPublisher.java`: `KafkaTemplate` y key.
- `src/main/java/com/academia/rutaflow/consumer/RuteoListener.java`: `@KafkaListener` y metadatos.
- `compose.yaml`: un broker KRaft para laboratorio y PostgreSQL local.

Con la aplicación en marcha, abre otra terminal y publica un envío:

```bash
curl -i -X POST http://localhost:8080/envios \
  -H 'Content-Type: application/json' \
  -d '{"referencia":"RF-0001"}'
```

**Qué observar:** el endpoint responde `202 Accepted` con `envioId` y `eventId`. Copia el `envioId` de la respuesta y consulta la proyección:

```bash
curl http://localhost:8080/envios/PEGA_AQUI_EL_ENVIO_ID/ruta
```

Reemplaza `PEGA_AQUI_EL_ENVIO_ID` por el UUID de la respuesta anterior. La consulta puede dar `404` hasta que el consumidor procese el mensaje; después incluye `"estado":"RECIBIDO"`. Los logs de Spring muestran `key`, `partition` y `offset`. La asignación puede variar entre envíos, pero los eventos con la misma key van a la misma partición.

**Resultado esperado:** la API responde `202`, el consumer group registra el envío y la consulta de ruta muestra `RECIBIDO`. **Fallo deliberado:** envía una referencia vacía; diagnostica el error `400` y comprueba que la API no crea un envío. Luego cambia en una copia de práctica la key de `envioId` a `eventId`, publica varias ocurrencias del mismo envío y compara las particiones: ya no puedes inferir orden por agregado.

Para detener la aplicación, usa `Ctrl+C`; para bajar el laboratorio, desde esta carpeta:

```bash
docker compose down
```

1. Publica varios envíos y anota `envioId`, key, partición y offset del log.
2. Ejecuta `mvn test -Dtest=KafkaFlowIntegrationTest#outboxPublishesWithAggregateKeyAndConsumerAppliesEffectOnce`.
   La prueba comprueba la key y que el efecto llega a SQL.
3. Cambia la key en una rama temporal de práctica; predice qué orden deja de preservarse y confirma la predicción observando particiones.
4. Levanta dos instancias del consumidor con el mismo `group-id` y después otra con un grupo distinto. Antes de concluir, espera a que termine el rebalanceo y verifica qué grupos reciben cada record.

**Pista:** el orden que Kafka garantiza es por partición. Cambiar el número de particiones puede cambiar la asignación de una key; no uses la partición como identidad de negocio persistente.

**Si falla.** Si la proyección sigue en `404`, espera a que el consumidor procese y revisa el `group-id` y la conexión del listener antes de suponer un error de negocio. Si dos envíos del mismo agregado aparecen desordenados, la key no es `envioId`. Si la segunda instancia del consumidor no recibe nada, compárala con el número de particiones: no hay paralelismo adicional por encima de ese límite. Si dos grupos distintos no reciben ambos el flujo, están usando el mismo `group-id`.

#### Aplica

En el proyecto integrador RutaFlow, trabaja en una copia del laboratorio y crea `src/test/java/com/academia/rutaflow/ContratoEnvioCreadoTest.java`. Comprueba que el JSON de `EnvioCreado` conserva `eventId`, `envioId`, `version`, `occurredAt` y `referencia`, y documenta cómo leerían el evento una versión anterior y una nueva del consumidor. Ejecuta `mvn test` y guarda el test, el log y la respuesta HTTP como evidencia.

No elimines ni renombres campos del contrato sin probar antes ambos lados. Este proyecto fija el tipo de destino para enseñar una configuración simple; no es una política general para aceptar clases arbitrarias desde mensajes externos.

**Checklist de salida.**

- [ ] La copia `ejemplo-kafka-basico` arranca con `mvn test` y el broker de Compose.
- [ ] La API responde `202` con `envioId` y `eventId` para `RF-0001`.
- [ ] La proyección consultada por `envioId` llega a `"estado":"RECIBIDO"`.
- [ ] El log muestra key, partición y offset del record.
- [ ] `KafkaFlowIntegrationTest#outboxPublishesWithAggregateKeyAndConsumerAppliesEffectOnce` pasa y demuestra la key del agregado.
- [ ] Una referencia vacía produce `400` y no crea envío.
- [ ] El test `ContratoEnvioCreadoTest` conserva los cinco campos y documenta lectura anterior y nueva.

**Si falla.** Si `mvn test` no arranca, comprueba JDK 27+, Maven 3.9+ y que estás dentro de la copia. Si el broker no levanta, revisa Docker Compose v2 y el archivo `compose.yaml`. Si el consumidor no recibe después de cambiar la key, vuelve a la versión con `envioId`: el problema está en el particionado, no en la proyección.

Debes poder mostrar la respuesta `202`, la proyección `RECIBIDO`, el test de key y un log con partición/offset; explica qué cambia al usar `eventId` como key. Explica por qué dos grupos reciben el flujo por separado y por qué no existe orden global entre particiones. Conserva este contrato y usa el mismo `eventId` al estudiar reintentos e inbox en el Tema 2. **Cuándo no usar Kafka:** no lo agregues para una operación interna que necesita una respuesta inmediata y no requiere desacoplamiento durable; una llamada HTTP puede ser más simple.

**Errores comunes:** usar una key aleatoria y luego esperar orden por envío; interpretar `auto-offset-reset: earliest` como rebobinado de un grupo existente; o escalar consumidores sin comparar su número con las particiones.

**Fuente oficial:** [Spring Boot: Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html), [Spring Kafka: serialización JSON](https://docs.spring.io/spring-kafka/reference/kafka/serdes.html) y [Apache Kafka: conceptos](https://kafka.apache.org/documentation/#intro_concepts_and_terms).

### Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia · Experto · 1 h 50 min

**Prerrequisito:** el contrato, la key y el listener del Tema 1, con la copia `ejemplo-kafka-basico` en funcionamiento.

**Al terminar podrás:** distinguir un evento inválido de un fallo transitorio, enviar un mensaje irrecuperable a DLT y demostrar que recibir dos veces el mismo `eventId` no repite el efecto SQL.

#### Aprende

**Caso real:** el consumidor puede confirmar el cambio de proyección y caer antes de que Kafka confirme el offset. El mismo evento vuelve a entregarse. En otro caso, un mensaje inválido falla cada vez: esperar no repara un contrato que no puede procesarse.

**¿Por qué es importante?** Una entrega repetida puede duplicar un efecto de negocio; un mensaje defectuoso puede detener el avance. Distinguir fallos temporales, permanentes y duplicados permite recuperar el flujo conservando evidencia: sin deduplicación, una reentrega puede duplicar asignaciones, cargos o notificaciones; sin una ruta de recuperación, un mensaje venenoso puede bloquear el avance.

En este laboratorio, el listener confirma el offset después de que `RuteoService.procesar` retorna; el servicio usa una transacción SQL para escribir inbox y proyección. Si el proceso cae en la ventana entre efecto y commit del offset, Kafka puede volver a llamar al handler.

La tabla `event_inbox` tiene `event_id` como clave primaria. El handler consulta si ya existe y, si no, inserta inbox y actualiza la proyección en la misma transacción. La restricción única protege también contra dos entregas concurrentes: si hay una carrera, una transacción pierde y puede reintentarse; la siguiente lectura ya verá el evento confirmado.

`DefaultErrorHandler` usa `FixedBackOff(1000, 2)`: un intento inicial y hasta dos reintentos. `InvalidEventException` se clasifica como no reintentable y se envía directamente a `rutaflow.envio.creado.DLT`. La DLT tiene tres particiones para conservar el número del tópico original, y el recoverer mantiene la partición de origen.

`enable.idempotence` protege retransmisiones del productor dentro de las garantías de Kafka; no coordina un commit Kafka con una transacción PostgreSQL. Inbox evita repetir un efecto de negocio, pero no elimina los duplicados del tópico.

**Modelo mental:** el inbox es el registro de “eventos ya aplicados”; la DLT es una bandeja de aislamiento, no una papelera ni un mecanismo automático de reparación.

**Analogía:** la DLT se parece a una bandeja de excepción que conserva el paquete para diagnóstico. A diferencia del flujo normal, una persona debe decidir si corrige, descarta o reproduce el mensaje.

#### Practica

En una terminal desde la raíz del repositorio, crea otra copia limpia y ejecuta sus pruebas. Las pruebas usan Kafka embebido y H2; no requieren contenedores.

```bash
# Copia independiente para repetir el tema sin depender de datos de una sesión anterior.
cp -R examples/spring-kafka-rutaflow ejemplo-kafka-reintentos
cd ejemplo-kafka-reintentos
mvn test
```

Usa esa copia. Revisa `src/main/java/com/academia/rutaflow/config/KafkaConfiguration.java`, `src/main/java/com/academia/rutaflow/consumer/RuteoService.java` y `src/main/resources/schema.sql`. Ejecuta primero las pruebas del laboratorio:

```bash
mvn test
```

Abre `src/main/java/com/academia/rutaflow/consumer/RuteoService.java`. En `procesar`, identifica el orden de operaciones: validar, comprobar `event_inbox`, insertar el ID y actualizar `route_projection`. Ambas escrituras están dentro del mismo `@Transactional`.

**Ejecuta el ejemplo** (publica dos veces el mismo `eventId`):

```bash
mvn test -Dtest=KafkaFlowIntegrationTest#outboxPublishesWithAggregateKeyAndConsumerAppliesEffectOnce
```

**Qué observar:** el test espera la escritura del inbox/proyección y vuelve a publicar el mismo evento. Espera además que la segunda llamada al servicio devuelva `false` (duplicado): comprobar solo conteos podría pasar antes de consumir la segunda copia. Ambas filas continúan en uno. El tiempo de espera del test usa una condición con timeout; no depende de `Thread.sleep()`.

Ahora ejecuta el escenario de mensaje inválido:

```bash
# Confirma que un error permanente termina en DLT sin escribir el inbox.
mvn test -Dtest=KafkaFlowIntegrationTest#invalidEventIsRecoveredToDeadLetterTopic
```

**Qué observar:** una referencia compuesta solo por espacios no crea fila inbox y el payload termina en el tópico DLT. La clasificación evita gastar los dos reintentos en un error permanente.

Simula también un fallo temporal:

```bash
# El test falla una vez y después permite que el consumidor procese el evento.
mvn test -Dtest=KafkaFlowIntegrationTest#transientConsumerFailureRetriesAndThenCommits
```

**Resultado esperado:** el servicio es llamado dos veces, pero solo existe una fila inbox y una proyección. El retardo de un segundo entre intentos viene del `FixedBackOff` de la configuración.

Comprueba ahora dos fallos distintos desde la carpeta del laboratorio:

```bash
mvn test -Dtest=KafkaFlowIntegrationTest#malformedJsonKeepsOriginalBytesInDlt
mvn test -Dtest=KafkaFlowIntegrationTest#projectionFailureRollsBackInboxAndAllowsRedelivery
```

El primero publica los 12 bytes de `{broken-json` sin convertirlos en un objeto Java. Abre `src/main/java/com/academia/rutaflow/config/EventOrBytesSerializer.java`: los objetos se serializan como JSON, pero los `byte[]` se conservan. **Fallo deliberado:** en una copia, reemplaza el serializador en `src/main/resources/application.yml` por `org.springframework.kafka.support.serializer.JacksonJsonSerializer`. Ejecuta el primer test: la DLT contendrá 18 bytes de JSON/base64 y fallará la comparación con el original. Restaura el serializador y repite. La DLT debe conservar evidencia, no transformar inadvertidamente el error. `setFailIfSendResultIsError(true)` hace que un fallo al publicar en DLT se propague al manejador; consulta el [manejo de errores oficial](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html).

El segundo test usa una referencia de 121 caracteres para violar el límite SQL de 120 después de insertar el inbox. Observa la excepción y verifica **cero filas** en inbox y proyección. Después usa una referencia válida con el mismo ID: se aplica una vez y la siguiente llamada se reconoce como duplicado. Es una reparación de laboratorio de un evento nunca confirmado; un replay operativo requiere conservar el original y registrar quién autoriza la corrección.

Eliminar la clave primaria y reenviar secuencialmente no demuestra una carrera: el `SELECT` seguiría detectando el ID. Para estudiar concurrencia harían falta dos transacciones que lean la ausencia antes de insertar, una barrera controlada y PostgreSQL real; queda como ampliación. La imagen de retry topics no equivale a este ejemplo: aquí se usa `FixedBackOff` en el consumidor, no tópicos separados con demoras de 5, 10 y 20 segundos.

La investigación oficial del 2026-10-30 confirma que Spring Kafka ofrece reintentos no bloqueantes mediante `@RetryableTopic` o `RetryTopicConfiguration`: el registro fallido se republica a uno o más tópicos de retry y finalmente puede llegar a DLT. Esa decisión sacrifica el orden del tópico principal y no se combina con listeners batch ni con transacciones del contenedor. El laboratorio resuelve fallos breves con dos reintentos bloqueantes de un segundo; cambiarlo a retry topics sería una decisión de arquitectura, no una mejora automática. Consulta [Non-Blocking Retries](https://docs.spring.io/spring-kafka/reference/retrytopic.html) y [How the Pattern Works](https://docs.spring.io/spring-kafka/reference/retrytopic/how-the-pattern-works.html). El árbol de dependencias ejecutado usa Spring Kafka 4.1.1; no se copió una configuración de otra versión. Si implementas la ampliación, prueba explícitamente el orden observado para dos eventos con la misma `envioId` y define cómo reconciliar una actualización antigua que salga de retry después de una nueva.

1. Cambia temporalmente la referencia del evento inválido por una referencia válida y ejecuta otra vez el test: predice qué excepción deja de ocurrir y compruébalo.
2. Introduce una excepción recuperable en el consumidor de práctica; registra el número de entregas y verifica el backoff y el máximo de reintentos.
3. Introduce un fallo después de insertar inbox y antes de escribir la proyección. Comprueba que la transacción revierte ambas escrituras y que la reentrega puede procesar el evento.
4. Inspecciona los headers de DLT y redacta un procedimiento de replay que preserve `eventId`, registre motivo/operador y limite el lote. El laboratorio envía a DLT, pero no implementa un servicio operativo de replay.

**Pista:** el efecto queda protegido porque el inbox y la proyección comparten transacción SQL. Si el listener retorna antes de completar esa transacción, el offset puede avanzar sin que el efecto quede persistido.

**Si falla.** Si el mismo evento escribe dos veces la proyección, el inbox y la proyección no comparten transacción o la consulta del inbox se hace fuera de ella. Si un mensaje inválido se reintenta dos veces antes de la DLT, `InvalidEventException` no está clasificada como no reintentable. Si la DLT contiene un payload mayor que el original, el serializador está transformando los bytes. Si `projectionFailureRollsBackInboxAndAllowsRedelivery` deja filas, el fallo ocurrió después del commit y debes moverlo antes. Si una prueba de concurrencia no reproduce la carrera con H2, no está probando el bloqueo del motor real.

#### Aplica

En tu proyecto integrador RutaFlow, crea `src/test/java/com/academia/rutaflow/ConsumerRollbackTest.java` en una copia de práctica. Inyecta una falla entre el insert de inbox y la actualización de la proyección, y verifica que ambas tablas quedan sin cambios. Después reentrega el mismo evento y demuestra que se procesa una vez.

Entrega también un runbook breve: cómo localizar un evento en DLT, qué datos registrar antes de reproducirlo y cómo detener un replay con errores. No reinyectes mensajes inválidos en un bucle.

**Checklist de salida.**

- [ ] La copia `ejemplo-kafka-reintentos` pasa `mvn test` con Kafka embebido y H2.
- [ ] El test de duplicado demuestra una sola fila inbox y una sola proyección.
- [ ] La segunda llamada a `procesar` devuelve `false` por duplicado.
- [ ] El evento inválido termina en `rutaflow.envio.creado.DLT` sin escribir inbox.
- [ ] La prueba de fallo transitorio confirma el `FixedBackOff` de un intento inicial y dos reintentos.
- [ ] `malformedJsonKeepsOriginalBytesInDlt` conserva los 12 bytes originales.
- [ ] `ConsumerRollbackTest` demuestra cero filas tras el fallo entre inbox y proyección.
- [ ] El runbook de replay registra `eventId`, motivo, operador y límite de lote.

**Si falla.** Si el test de duplicado pasa por conteos antes de consumir la segunda copia, añade la comprobación del valor de retorno `false` y una condición con timeout. Si el evento inválido agota los reintentos, revisa la clasificación de `InvalidEventException`. Si la DLT no recibe nada, comprueba `setFailIfSendResultIsError(true)` y el nombre del tópico. Si el inbox queda escrito tras un fallo de proyección, las dos escrituras no están en la misma transacción.

La evidencia mínima son las dos pruebas automatizadas, los conteos de inbox/proyección y el payload de DLT; `event_inbox` conserva una sola fila por `eventId`. Distingue claramente entre reintentar un problema temporal y recuperar un contrato que necesita corrección. **Cuándo no basta este patrón:** si el efecto ocurre fuera de la misma base SQL (por ejemplo, un cargo externo), la inbox por sí sola no vuelve idempotente ese proveedor; necesitas una clave de idempotencia o reconciliación en esa frontera.

**Errores comunes:** afirmar “exactly once” entre SQL y Kafka; usar el offset como clave de negocio; capturar una excepción y retornar normalmente antes del commit SQL; o reintentar indefinidamente un mensaje inválido.

**Fuente oficial:** [Spring Kafka: manejo de errores](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html) y [Spring Boot: configuración Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html).

### Tema 3: Outbox transaccional y flujo de negocio · Experto · 1 h 50 min

**Prerrequisito:** transacciones SQL, la key del Tema 1 e idempotencia del Tema 2.

**Al terminar podrás:** explicar y probar la ventana de fallo entre PostgreSQL y Kafka, reclamar eventos pendientes sin mantener una transacción abierta durante el envío y aceptar duplicados seguros si el proceso cae después del ack del broker.

#### Aprende

**Caso real:** si la API guarda el envío y luego publica directamente, una caída entre ambas operaciones deja un envío sin evento. Si publica primero y después hace rollback SQL, el consumidor recibe un evento para un envío que nunca se confirmó.

**¿Por qué es importante?** Guardar un envío y publicar su evento son operaciones en sistemas diferentes. El outbox conserva la intención de publicación en la misma transacción del envío para que una caída del broker no la pierda. Kafka y PostgreSQL son sistemas con commits independientes: una `@Transactional` JDBC normal no incluye el ack del broker.

El outbox escribe el envío y la representación serializada del evento en una sola transacción SQL. Un dispatcher reclama un lote usando `FOR UPDATE SKIP LOCKED`, asigna un lease y confirma esa transacción corta antes de esperar al broker. Publica con `aggregate_id` como key, espera el ack con timeout y solo entonces marca `published_at`.

El fallo entre ack Kafka y actualización `published_at` todavía puede duplicar el evento. El inbox del tema anterior neutraliza el efecto repetido. Los leases evitan que dos dispatchers reclamen simultáneamente la misma fila mientras el lease sea válido; no eliminan la necesidad de idempotencia ante expiración, timeout o caída.

El dispatcher local aplica backoff exponencial acotado y guarda la causa en `last_error`. No se mantienen bloqueos SQL durante el envío. El laboratorio solo demuestra un dispatcher periódico; la práctica independiente extiende la operación a varias instancias y requiere más pruebas.

**Modelo mental:** el outbox es una bandeja SQL confirmada junto con el cambio de negocio; el dispatcher recoge el lote, obtiene el ack y luego marca la entrega.

**Analogía:** como una bandeja de salida duradera, evita olvidar una carta si el proceso se apaga. No impide que la carta salga dos veces si el mensajero no alcanza a registrar que ya la entregó.

#### Practica

Desde la raíz del repositorio, crea una tercera copia limpia y ejecuta sus pruebas:

```bash
# Copia independiente para reproducir el flujo completo desde un estado conocido.
cp -R examples/spring-kafka-rutaflow ejemplo-kafka-outbox
cd ejemplo-kafka-outbox
mvn test
```

Continúa con el proyecto; revisa `src/main/java/com/academia/rutaflow/envio/CrearEnvioService.java`, `src/main/java/com/academia/rutaflow/outbox/OutboxRepository.java` y `src/main/java/com/academia/rutaflow/outbox/OutboxDispatcher.java`.

Abre `CrearEnvioService.crear`. Las llamadas a `envios.guardar` y `outbox.guardar` están dentro del mismo método `@Transactional`; el servicio no publica directamente en Kafka. Abre después `OutboxRepository.reclamarLote` y observa que el bloqueo solo cubre la selección y concesión del lease.

El schema real está en `src/main/resources/schema.sql`; no crees una migración Flyway que el proyecto no configura.

**Ejecuta el ejemplo** (flujo manual con PostgreSQL y Kafka):

```bash
# Inicia las dependencias locales antes de arrancar la API.
docker compose up -d --wait
mvn spring-boot:run
```

En otra terminal, crea un envío y consulta la proyección como en el Tema 1. Para observar recuperación, detén Kafka antes de publicar; el envío debe seguir persistido con una fila outbox pendiente. Vuelve a levantar Kafka y observa que el dispatcher publica el evento.

**Resultado esperado:** la API responde aunque Kafka esté temporalmente caído; tras restaurarlo, la fila se publica y la proyección llega a `RECIBIDO`. El dispatcher no marca el evento como publicado antes del ack.

Para comprobar la rama de recuperación sin Docker, ejecuta:

```bash
mvn test -Dtest=KafkaFlowIntegrationTest#failedPublishRemainsPendingAndCanRecover
```

Abre ese método en `src/test/java/com/academia/rutaflow/KafkaFlowIntegrationTest.java`. La primera publicación devuelve un futuro fallido simulado: espera cero publicaciones, una fila pendiente, `attempts = 1`, lease liberado y error guardado. El test adelanta únicamente `next_attempt_at` y permite la publicación real al broker embebido: espera `published_at`, `attempts = 2` y una fila inbox. Esto verifica la lógica de recuperación, no una caída real de red.

**Fallo deliberado:** detén la aplicación después de que Kafka acepte el evento y antes de que PostgreSQL marque `published_at`. Diagnostica el duplicado tras reiniciar: puede publicarse una segunda copia, pero inbox debe mantener un solo efecto SQL.

1. Consulta `outbox_event` en PostgreSQL antes y después de publicar; registra `attempts`, `lease_until`, `published_at` y `last_error`.
2. Interrumpe el broker antes de un envío y confirma que el error queda visible y se programa un backoff acotado.
3. Simula la ventana “ack Kafka, caída antes de marcar publicado”. Demuestra que puede haber dos records en Kafka y una sola fila de efecto en `event_inbox`.
4. Inspecciona la consulta con `SKIP LOCKED` y explica cómo dos dispatchers podrían reclamar lotes distintos. Luego prueba el caso de lease vencido: todavía puede haber un duplicado, así que no retires la inbox.

**Pista:** el outbox evita perder el evento entre el commit de negocio y el intento de publicar; no es una transacción distribuida y no evita duplicados después de que el broker acepta el record.

**Si falla.** Si el envío se pierde cuando Kafka está caído, el outbox no se está escribiendo en la misma transacción o el dispatcher marca `published_at` sin ack. Si el dispatcher no reintenta, revisa `next_attempt_at`, `attempts` y `last_error`. Si dos dispatchers procesan la misma fila, el lease o `SKIP LOCKED` no cubren la reclamación. Si no aparece el duplicado esperado tras el ack, el corte ocurrió antes de que el broker aceptara el record. Si `SKIP LOCKED` se comporta distinto en H2, repite con PostgreSQL real antes de concluir.

#### Aplica

En el proyecto integrador RutaFlow, crea `src/test/java/com/academia/rutaflow/OutboxRecoveryTest.java` en tu copia. Cubre rollback de la creación, broker no disponible, lease expirado y caída después del ack. Ejecuta las pruebas con PostgreSQL real además de H2 antes de considerar verificado el comportamiento de bloqueo específico del motor.

Para una segunda instancia del dispatcher, mide edad del evento pendiente, tasa de reintentos, consumer lag y mensajes DLT. Diseña retención, limpieza y un replay que preserve `eventId`. Estas piezas operativas no están implementadas ni certificadas por el laboratorio base.

**Checklist de salida.**

- [ ] La copia `ejemplo-kafka-outbox` pasa `mvn test` y el flujo manual con Compose.
- [ ] `CrearEnvioService.crear` guarda envío y outbox dentro de la misma transacción.
- [ ] La API responde con Kafka detenido y deja una fila outbox pendiente.
- [ ] El dispatcher publica con `aggregate_id` como key y espera el ack antes de `published_at`.
- [ ] `failedPublishRemainsPendingAndCanRecover` confirma `attempts`, lease liberado y recuperación.
- [ ] El duplicado tras el ack se demuestra con dos records y una sola fila inbox.
- [ ] `OutboxRecoveryTest` cubre rollback, broker caído, lease expirado y caída tras el ack.
- [ ] El informe separa qué se ejecutó con Kafka embebido/H2 y qué requiere PostgreSQL real.

**Si falla.** Si el flujo manual no arranca, confirma que Compose está arriba con `docker compose ps` y que la API usa ese broker. Si la fila queda pendiente para siempre, revisa el backoff y `next_attempt_at`. Si `attempts` no sube, el error se está capturando sin actualizar la fila. Si el lease nunca expira, estás probando con H2 un comportamiento que requiere PostgreSQL.

Entrega el test de rollback, evidencia de recuperación tras caída, filas outbox/inbox y logs con key/partición/offset. Especifica qué se ejecutó con Kafka embebido/H2 y qué requiere repetir con PostgreSQL y el broker de Compose. **Cuándo no usar outbox:** para un proceso local que no requiere entregar un evento durable a otro sistema, el patrón puede añadir tablas, dispatcher, leases, limpieza y operación sin beneficio.

**Errores comunes:** publicar dentro de una transacción SQL larga; marcar el evento como publicado antes del ack; asumir que `SKIP LOCKED` elimina duplicados tras un crash; o presentar un broker de un nodo como configuración de producción.

**Fuente oficial:** [Spring Boot: Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html), [Spring Kafka: JSON](https://docs.spring.io/spring-kafka/reference/kafka/serdes.html), [Spring Kafka: manejo de errores](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html) y [Apache Kafka: conceptos](https://kafka.apache.org/documentation/#intro_concepts_and_terms).
