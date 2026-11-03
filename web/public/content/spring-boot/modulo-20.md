# Módulo 20: Integraciones Spring — scheduling, eventos, correo y caché

## Aprende construyendo

Este módulo completa el mapa de integraciones de Spring identificado en las capturas. Cada capacidad se introduce con una prueba observable y un límite importante: el scheduler local no coordina instancias, los eventos en memoria no son durables, SMTP puede fallar y las cachés necesitan invalidación.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** un `@Scheduled` revisa pedidos vencidos en H2; un evento Spring actualiza una métrica; Caffeine cachea una tarifa y el test observa la invalidación.
- **Caso RutaFlow:** al confirmar un envío, la API debe guardar el estado aunque el broker, SMTP o Redis no respondan. Usa el outbox para el evento que debe sobrevivir reinicios, procesa la notificación fuera de la transacción y mide el resultado de caché entre instancias.

Este módulo demuestra el comportamiento dentro de una aplicación Spring. El módulo 21 desarrolla Kafka entre procesos; `@TransactionalEventListener` no sustituye al outbox y un evento local no es mensajería durable.

### Tema 1: Scheduling y tareas periódicas · Avanzado · 1 h 10 min

**Prerrequisito:** Módulo 19 de este track, JDK 27+ y Maven, y el entorno del stack instalado.

**Al terminar podrás:** ejecutar una tarea periódica con Spring y probar su operación sin esperar al reloj real.

#### Aprende

Una operación nocturna detecta pedidos que llevan demasiado tiempo pendientes y los marca para revisión.

**¿Por qué es importante?** Un trabajo periódico evita depender de una persona que lo ejecute a mano y crea un punto verificable para automatización operativa.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@EnableScheduling` | Prerrequisito | Sin ella la tarea no se ejecuta; el checklist exige "la app arranca con `@EnableScheduling`". |
| `@Scheduled` con cron y zona | Núcleo | `@Scheduled(cron = "${app.revision.cron}", zone = "UTC")` dispara `revisarPendientes()`. |
| `fixedRate` vs `fixedDelay` vs cron | Variante | El texto distingue que `fixedRate` mide desde el disparo anterior y `fixedDelay` desde que termina. |
| Scheduler local no coordina réplicas | Límite | Levantar dos instancias con el mismo cron y contador compartido produce dos ejecuciones. |
| Idempotencia y duración mayor al intervalo | Decisión | Se pide definir qué hacer si una ejecución supera el siguiente intervalo y usar clave idempotente o lock. |
| Prueba sin esperar al reloj | Diagnóstico | Inyectar `Clock` o un servicio sustituible evita que el test duerma cinco minutos. |
| Excepción tragada en el método | Error frecuente | Forzar una `RuntimeException` y comprobar que Micrometer la registre como fallo, no como "no se completó". |

Cada fila tiene su explicación individual a continuación.

**`@EnableScheduling` (Prerrequisito).** Esta anotación activa el soporte de tareas periódicas; sin ella Spring ignora `@Scheduled` y la tarea nunca se dispara. El tema la pone como primera casilla del checklist de salida ("la app arranca con `@EnableScheduling`") precisamente porque es la condición que habilita todo lo demás. Si la tarea no se ejecuta, el propio apartado "Si falla" manda revisarla antes que nada.

**`@Scheduled` con cron y zona (Núcleo).** El mecanismo central es anotar `revisarPendientes()` con `@Scheduled(cron = "${app.revision.cron}", zone = "UTC")`, que externaliza la expresión a `application.yml` y fija explícitamente la zona horaria. Configurar la zona evita que el disparo dependa de la hora del servidor, un error silencioso cuando el proceso corre en otro huso. El laboratorio usa `app.revision.cron: "0 */5 * * * *"` para observar el comportamiento sin esperar demasiado.

**`fixedRate` vs `fixedDelay` vs cron (Variante).** `@Scheduled` admite tres modos y el tema los contrasta por su punto de referencia temporal: `fixedRate` cuenta desde el inicio del disparo anterior, `fixedDelay` desde que el anterior termina y cron desde una expresión de calendario. Elegir mal el modo cambia cuántas veces y cuándo corre la tarea, sobre todo si una ejecución dura casi tanto como el intervalo. La decisión depende de si importa el ritmo fijo o dejar holgura entre ejecuciones.

**Scheduler local no coordina réplicas (Límite).** El scheduler es local al proceso, así que con tres réplicas la misma tarea puede ejecutarse tres veces. El fallo deliberado lo hace visible: dos instancias con el mismo cron y un contador compartido producen dos ejecuciones, y el diagnóstico correcto es que `@Scheduled` no es un lock distribuido. Este límite es la frontera entre una automatización local y la coordinación entre instancias.

**Idempotencia y duración mayor al intervalo (Decisión).** Cuando el negocio exige exactamente una ejecución, el tema obliga a decidir entre una clave idempotente que evite procesar dos veces el mismo envío, un lock distribuido o un job de Spring Batch con repositorio. También pide definir qué ocurre si una ejecución supera el siguiente intervalo, porque ahí aparecen solapamientos. Es una decisión de diseño operativo, no un ajuste de configuración.

**Prueba sin esperar al reloj (Diagnóstico).** La buena señal es que el test invoca el servicio y comprueba el criterio de vencimiento sin dormir cinco minutos, lo que se logra inyectando `Clock` o una interfaz de servicio sustituible. Si la prueba tarda minutos, el diagnóstico es que está esperando al reloj real. Así la lógica de vencimiento queda verificada de forma determinista y rápida.

**Excepción tragada en el método (Error frecuente).** Un error común es capturar la excepción del servicio dentro del método programado sin registrarla: el scheduler "parece funcionar" mientras la tarea real nunca se completa. La pista propone lanzar una `RuntimeException` dentro de `revisarPendientes()` y confirmar con Micrometer que esa ejecución fallida queda registrada como fallo, no solo como ausencia de resultado. Observar la métrica distingue un fallo silencioso de una ejecución correcta.

`@EnableScheduling` activa las tareas; `@Scheduled` admite `fixedRate`, `fixedDelay` o una expresión cron. `fixedRate` mide desde el inicio del disparo anterior; `fixedDelay`, desde que termina. Configura explícitamente zona horaria en cron. Por defecto, el scheduler es local al proceso: con tres réplicas, la tarea puede ejecutarse tres veces.

Un scheduler no es una cola durable ni una exclusión distribuida. Si un trabajo puede durar más que el intervalo, define concurrencia limitada, idempotencia y un mecanismo de coordinación o utiliza Spring Batch y su repositorio cuando el trabajo deba reanudarse.

**Analogía:** una tarea periódica es como el despertador o el riego automático del jardín: se dispara solo según un horario (la expresión `cron`), sin que nadie tenga que acordarse de pulsar el botón cada día.

#### Practica

Genera una app Spring Boot con `web` y `actuator`.

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/pedidos/PedidosScheduler.java` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/main/java/academia/pedidos/PedidosScheduler.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

En `src/main/java/academia/pedidos/PedidosScheduler.java`:

```java
@Component
public class PedidosScheduler {
    private final RevisionPedidos revision;

    public PedidosScheduler(RevisionPedidos revision) {
        this.revision = revision;
    }

    @Scheduled(cron = "${app.revision.cron}", zone = "UTC")
    public void revisarPendientes() {
        revision.marcarVencidos();
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

Activa scheduling con `@EnableScheduling` en una configuración. En `src/main/resources/application.yml` configura `app.revision.cron: "0 */5 * * * *"` para el laboratorio. Inyecta `Clock` o una interfaz de servicio para probar lógica de vencimiento determinísticamente. Ejecuta `./mvnw test`.

**Resultado esperado:** la prueba invoca el servicio y comprueba el criterio de vencimiento; no depende de que el test duerma cinco minutos. **Fallo deliberado:** levanta dos instancias con el mismo cron y un contador compartido; observa dos ejecuciones. Diagnostica que un `@Scheduled` no es un lock distribuido.

Agrega una tarea que registre inicio, duración y resultado con Micrometer. Fuerza una excepción del servicio y verifica que el scheduler no la oculte silenciosamente ni deja de producir señales operacionales. Define qué hacer si una ejecución supera el siguiente intervalo.

**Pista:** lanza una `RuntimeException` dentro de `revisarPendientes()` y vuelve a ejecutar la app; si no agregaste manejo de errores, el log solo muestra el stacktrace de esa ejecución y el scheduler sigue disparando la siguiente normalmente — confirma con Micrometer que esa ejecución fallida también queda registrada como fallo, no solo como "no se completó".

#### Aplica

Programa una revisión de envíos pendientes para el proyecto integrador de RutaFlow. Ejecuta dos instancias en tests o contenedores y prueba que una clave idempotente evita procesar dos veces el mismo envío. Si el negocio exige exactamente una ejecución coordinada, compara un lock distribuido o un job registrado con Spring Batch.

**Checklist de salida.**

- [ ] La app arranca con `@EnableScheduling` y `app.revision.cron` configurado con zona UTC.
- [ ] `PedidosScheduler` invoca el servicio y la prueba usa `Clock` o un servicio sustituible, sin dormir cinco minutos.
- [ ] El criterio de vencimiento se comprueba de forma determinista.
- [ ] Dos instancias con el mismo cron ejecutan la tarea dos veces y el diagnóstico queda registrado.
- [ ] Una excepción del servicio queda visible en el log y en la métrica de Micrometer.
- [ ] La decisión sobre ejecuciones que superan el intervalo está documentada.

**Si falla.** Si la prueba tarda minutos, está esperando al reloj real: inyecta `Clock` o el servicio de revisión. Si la tarea no se ejecuta, comprueba `@EnableScheduling`, la expresión cron y la zona horaria. Si el log muestra dos ejecuciones con dos instancias, no hay error de configuración: `@Scheduled` no coordina réplicas y necesitas idempotencia o un lock distribuido. Si la excepción desaparece del reporte, el método la está capturando sin registrarla.

Entrega configuración cron, test sin esperas reales, medición y prueba con dos instancias. **Cuándo no usarlo:** no uses `@Scheduled` como cola de tareas con payload o como garantía de ejecución única en cluster.

**Errores comunes:** asumir que `@Scheduled` es un lock distribuido y desplegar varias réplicas sin coordinación, dejando que la misma tarea se ejecute una vez por instancia, y tragar la excepción del servicio dentro del método programado sin relanzarla ni registrarla, con lo que el scheduler parece "funcionar" mientras la tarea real nunca se completa.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 2: Eventos locales, eventos transaccionales y mensajería · Avanzado · 1 h 20 min

**Prerrequisito:** Tema 1 de este módulo, el servicio transaccional de los módulos anteriores y el entorno del stack instalado.

**Al terminar podrás:** elegir entre un evento Spring en memoria, una publicación después del commit y mensajería duradera mediante Kafka/outbox.

#### Aprende

Al crear un envío, una auditoría local debe reaccionar al cambio.

**¿Por qué es importante?** Separar responsabilidades ayuda a mantener el servicio de negocio legible, pero un evento solo en memoria puede perderse si el proceso cae.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `ApplicationEventPublisher` | Prerrequisito | `publisher.publishEvent(new EnvioCreado(envioId))` desacopla dentro del mismo proceso. |
| Evento inmutable `EnvioCreado` | Núcleo | El checklist exige que `EnvioCreado` sea inmutable y se publique dentro de la transacción. |
| `@TransactionalEventListener(AFTER_COMMIT)` | Variante | `alCrear(EnvioCreado)` actúa tras el commit y no tras el rollback. |
| `@EventListener` sin fase transaccional | Error frecuente | Reemplazar la anotación deja la auditoría aunque el envío no se persista. |
| Caída entre commit y publicación | Límite | El proceso puede caer entre el commit y la ejecución del listener. |
| Outbox con `event_id` único | Núcleo | La tabla outbox tiene `event_id`, tipo, payload y `published_at`. |
| Dispatcher idempotente | Diagnóstico | Ejecutar el dispatcher dos veces sin marcar `published_at` revela si duplica. |
| Local vs mensajería durable | Decisión | Decidir qué eventos son locales y cuáles deben sobrevivir a un reinicio (Kafka, correo). |

Cada fila tiene su explicación individual a continuación.

**`ApplicationEventPublisher` (Prerrequisito).** Es el punto de entrada para desacoplar componentes dentro de una misma aplicación mediante `publisher.publishEvent(new EnvioCreado(envioId))`. Por sí solo no persiste ni distribuye el evento: vive en el proceso actual. Entenderlo es condición previa para ver por qué un evento local no basta cuando el dato debe sobrevivir a una caída.

**Evento inmutable `EnvioCreado` (Núcleo).** El tema declara `EnvioCreado` como evento inmutable y lo publica dentro de la transacción de negocio, lo que el checklist exige explícitamente. La inmutabilidad evita que un listener mute el estado que otros observan. Publicarlo dentro de la transacción es lo que luego habilita la variante transaccional y el outbox.

**`@TransactionalEventListener(AFTER_COMMIT)` (Variante).** El listener `alCrear(EnvioCreado)` se anota con `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` para actuar solo cuando la transacción local ya confirmó. El resultado esperado es que registre auditoría tras el commit y no haga nada tras el rollback. Es la variante que respeta el límite transaccional frente a un listener que reacciona de inmediato.

**`@EventListener` sin fase transaccional (Error frecuente).** El fallo deliberado reemplaza la anotación por `@EventListener`, fuerza rollback y muestra que la auditoría quedó aunque el envío no se persistió. Es el error típico de reaccionar antes del commit y dejar efectos colaterales de una transacción que nunca ocurrió. El checklist convierte esa observación en una casilla verificable.

**Caída entre commit y publicación (Límite).** Aun con `AFTER_COMMIT`, el proceso puede caer entre el commit y la ejecución del listener, y entonces el evento solo existía en memoria. Este es el límite que impide tratar `AFTER_COMMIT` como durable. El tema insiste en que por eso hace falta un outbox, no una fase de listener más.

**Outbox con `event_id` único (Núcleo).** La solución durable escribe el evento en una tabla outbox con `event_id` único, tipo, payload y `published_at`, dentro de la misma transacción que el dato de negocio. Así el evento y el cambio de estado se confirman o revierten juntos. El `event_id` único es la base para deduplicar más adelante.

**Dispatcher idempotente (Diagnóstico).** La pista hace ejecutar el dispatcher dos veces sobre la misma fila sin marcar `published_at` entre medio, simulando un reintento tras una caída, y observar si el efecto aguas abajo se duplica. Si duplica, el dispatcher no es idempotente: hay que marcar la fila como publicada en la misma operación que confirma el envío al broker o deduplicar por `event_id` en el consumidor. Esta prueba diagnostica si la entrega es segura ante reintentos.

**Local vs mensajería durable (Decisión).** El apartado "Aplica" obliga a decidir qué eventos son locales —como actualizar una métrica dentro del proceso— y cuáles deben sobrevivir a un reinicio, como notificar a Kafka o enviar correo. La decisión fija dónde se dibuja el límite de transacción y qué debe pasar por el outbox. Elegir mal aquí produce o eventos perdidos o complejidad innecesaria.

`ApplicationEventPublisher` desacopla componentes dentro de una misma aplicación y proceso; por sí solo no persiste ni distribuye el evento. `@TransactionalEventListener(phase = AFTER_COMMIT)` espera a que la transacción local termine antes de notificar. Aun así, el proceso puede caer entre el commit y la publicación.

Kafka u otro broker ofrece entrega entre procesos, con garantías que dependen de configuración y límites transaccionales. El patrón outbox escribe el evento en la misma transacción que el dato de negocio; un dispatcher lo publica después. El modelo mental: el evento local es una nota entre equipos de la misma oficina; el outbox es un registro en el libro de despacho que sobrevive al cierre.

**Analogía:** un evento local es gritar algo en la misma sala y que lo oiga quien está presente; un evento transaccional es esperar a que se firme el contrato antes de anunciar la noticia (si la transacción se cae, el anuncio nunca sale); y la mensajería es dejar el recado en un buzón para que otra oficina lo procese cuando pueda, aunque ahora esté cerrada.

#### Practica

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/envios/EnvioCreado.java` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

En `src/main/java/academia/envios/EnvioCreado.java` declara un evento inmutable; en el servicio transaccional:

```java
publisher.publishEvent(new EnvioCreado(envioId));
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

El listener en `src/main/java/academia/envios/AuditoriaEnvio.java`:

```java
@Component
public class AuditoriaEnvio {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alCrear(EnvioCreado evento) {
        registrarAuditoria(evento.envioId());
    }
}
```

Escribe un test `@SpringBootTest` que publique el evento dentro de una transacción confirmada y otro que fuerce rollback. Ejecuta `./mvnw test -Dtest=AuditoriaEnvioTest`.

**Resultado esperado:** el listener actúa después del commit y no actúa cuando la transacción revierte. **Fallo deliberado:** reemplaza la anotación por `@EventListener`, fuerza rollback y observa la auditoría que quedó aunque el envío no se persistió.

Agrega una tabla outbox con `event_id` único, tipo, payload y `published_at`; escribe el evento dentro de la transacción de negocio. Implementa un dispatcher que publique de forma repetible e idempotente y marque el resultado solo al confirmar la publicación.

**Pista:** ejecuta el dispatcher dos veces sobre la misma fila del outbox sin marcar `published_at` entre medio (simula un reintento tras una caída) y observa el efecto aguas abajo; si se duplica, el dispatcher no es idempotente — necesitas marcar la fila como publicada dentro de la misma operación que confirma el envío al broker, o deduplicar por `event_id` en el consumidor.

#### Aplica

Para el proyecto integrador de RutaFlow, decide cuáles eventos son locales (actualizar una métrica dentro del proceso) y cuáles deben sobrevivir un reinicio (notificar a Kafka, enviar correo). Implementa la persistencia del evento en el outbox dentro de la transacción que crea el envío, y luego sigue el laboratorio completo de Kafka del módulo 21 para publicar y consumirlo. Dibuja el límite de transacción y prueba la caída entre commit y dispatcher.

**Checklist de salida.**

- [ ] `EnvioCreado` es inmutable y se publica dentro de la transacción de negocio.
- [ ] El listener `AFTER_COMMIT` actúa tras el commit y no actúa tras el rollback.
- [ ] Reemplazar la anotación por `@EventListener` deja la auditoría aunque el envío no se persista.
- [ ] La tabla outbox tiene `event_id` único, tipo, payload y `published_at`.
- [ ] El dispatcher marca `published_at` solo al confirmar la publicación y no duplica al reintentar.
- [ ] El límite entre commit y dispatcher está dibujado y probado.

**Si falla.** Si el listener se ejecuta antes del commit, revisa la fase de `@TransactionalEventListener`. Si la auditoría aparece tras un rollback, la anotación es `@EventListener` o el test no envuelve la operación en una transacción. Si el dispatcher reenvía el mismo `event_id`, no está marcando la fila al confirmar o el consumidor no deduplica. Si el proceso cae entre commit y publicación, el evento solo existe en memoria: falta outbox.

Entrega pruebas de commit/rollback, tabla outbox y duplicado controlado. **Cuándo no usarlo:** no uses eventos locales para integración entre microservicios ni asumas que `AFTER_COMMIT` es durable.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** asumir que `@TransactionalEventListener(phase = AFTER_COMMIT)` ya es "durable" y no necesita outbox, cuando el proceso puede caer entre el commit y la ejecución del listener, y publicar al dispatcher antes de marcar la fila del outbox como publicada, de forma que un reinicio a mitad de camino reenvía el mismo evento sin control de duplicados.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 3: Correo con Spring Mail y entrega recuperable · Avanzado · 1 h 10 min

**Prerrequisito:** Tema 2 de este módulo y el entorno del stack instalado.

**Al terminar podrás:** crear un mensaje de correo desde un servicio, sustituir SMTP en tests y definir una política de reintento sin bloquear una transacción de negocio.

#### Aprende

Después de asignar un conductor, el cliente recibe confirmación por correo.

**¿Por qué es importante?** El proveedor SMTP es una dependencia externa: puede tardar, rechazar el mensaje o aceptar el correo aunque la respuesta se pierda.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Dependencia `mail` y config externa | Prerrequisito | El checklist exige declarar `mail` y leer host, puerto y credenciales de variables externas. |
| `JavaMailSender` y `SimpleMailMessage` | Núcleo | `CorreoPedido` arma `SimpleMailMessage` con destinatario, asunto y referencia y llama `sender.send`. |
| SMTP no es transaccional con la BD | Límite | El texto advierte no mantener una transacción SQL abierta durante la llamada SMTP. |
| Sustituir SMTP en test con mock | Diagnóstico | Un `JavaMailSender` simulado captura `SimpleMailMessage` sin contactar SMTP. |
| Reintento recuperable vía outbox | Variante | Un timeout queda en outbox con próxima fecha de reintento y número de intentos. |
| Idempotencia por `event_id` | Decisión | El dispatcher no duplica con el mismo `event_id` si el proveedor ofrece clave de idempotencia. |
| Riesgo residual de reenvío | Error frecuente | Sin clave de idempotencia debe documentarse el posible reenvío, no resolverlo con más reintentos. |

Cada fila tiene su explicación individual a continuación.

**Dependencia `mail` y config externa (Prerrequisito).** El proyecto debe declarar la dependencia `mail` y leer `spring.mail.host`, puerto y credenciales desde variables externas o un secret manager, nunca desde `application.yml` versionado. El fallo deliberado usa credenciales literales y rompe la configuración en CI justamente para empujar el secreto fuera del código. Sin esta base, el resto del tema no arranca de forma segura.

**`JavaMailSender` y `SimpleMailMessage` (Núcleo).** El mecanismo central es `CorreoPedido`, que recibe `JavaMailSender` por constructor, arma un `SimpleMailMessage` con `setTo`, `setSubject` y `setText` incluyendo la referencia del pedido, y lo envía con `sender.send(message)`. El checklist verifica que el mensaje lleve destinatario, asunto y texto con la referencia. Es la operación observable que todo el tema prueba y protege.

**SMTP no es transaccional con la BD (Límite).** El envío no es transaccional respecto a la base de datos, así que el tema prohíbe mantener una transacción SQL abierta durante la llamada SMTP y enviar correo síncrono en la transacción HTTP crítica. Si SMTP tarda o falla, no debe arrastrar a revertir una operación de negocio ya válida. Este límite separa la confirmación del negocio del canal de notificación.

**Sustituir SMTP en test con mock (Diagnóstico).** En el test se reemplaza `JavaMailSender` por un mock que captura el `SimpleMailMessage` y valida destinatario y asunto sin enviar correo ni contactar un SMTP externo. Si el test intenta conectarse a SMTP, el diagnóstico es que el sender no está sustituido o se cargó la configuración real en el contexto. Así se verifica el armado del mensaje de forma aislada y reproducible.

**Reintento recuperable vía outbox (Variante).** Para entrega recuperable, un timeout SMTP simulado se registra en outbox con la próxima fecha de reintento y el número de intentos, haciendo el estado observable. Si el timeout no deja registro, el envío no está pasando por outbox. Esta variante convierte un fallo transitorio en algo reintentable y auditable en vez de una pérdida silenciosa.

**Idempotencia por `event_id` (Decisión).** Cuando el proveedor admite clave de idempotencia, el dispatcher debe garantizar que una segunda ejecución con el mismo `event_id` no envíe dos notificaciones. La decisión depende de tener un identificador estable del evento, porque SMTP no ofrece entrega exactamente una vez de forma general. Elegir el `event_id` como clave es lo que hace seguro el reintento.

**Riesgo residual de reenvío (Error frecuente).** La pista plantea el caso del timeout ambiguo en que no se sabe si el correo salió; si el proveedor no da clave de idempotencia, no se puede garantizar cero duplicados. El error es intentar "resolverlo" con más reintentos en vez de documentar ese posible reenvío como riesgo residual aceptado. También es error reintentar sin registrar intentos ni próxima fecha, perdiendo la distinción entre fallo transitorio y permanente.

`JavaMailSender` crea y envía mensajes; la configuración de host/puerto/credenciales debe venir de entorno o secret manager. El envío no es transaccional con la base de datos. No mantengas una transacción SQL abierta durante la llamada SMTP ni registres credenciales o contenido sensible en logs.

La operación de negocio debe confirmar independientemente del canal de notificación; un outbox permite reintentar con estado observable. La deduplicación requiere un identificador estable del evento, porque SMTP no ofrece una garantía general de entrega exactamente una vez.

**Analogía:** enviar correo con entrega recuperable es como el correo certificado: si el cartero no encuentra al destinatario, no tira la carta, la guarda y reintenta. El registro de intentos es el comprobante que te deja saber si llegó o sigue pendiente de reenvío.

#### Practica

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/notificaciones/CorreoPedido.java` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

Genera el proyecto con `mail` y configura `spring.mail.host`, puerto y credenciales por variables externas. En `src/main/java/academia/notificaciones/CorreoPedido.java`:

```java
@Service
public class CorreoPedido {
    private final JavaMailSender sender;

    public CorreoPedido(JavaMailSender sender) { this.sender = sender; }

    public void enviarConfirmacion(String destinatario, String referencia) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject("Pedido confirmado");
        message.setText("Referencia: " + referencia);
        sender.send(message);
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

En un test, reemplaza `JavaMailSender` con un mock y captura `SimpleMailMessage`; valida destinatario y asunto sin enviar correo. Ejecuta `./mvnw test -Dtest=CorreoPedidoTest`.

**Resultado esperado:** el mock recibe un mensaje con los campos esperados y ningún SMTP externo se contacta. **Fallo deliberado:** usa credenciales SMTP literales y falla la configuración en CI; mueve el secreto a variables externas y falla explícitamente si falta en el perfil de producción.

Simula timeout SMTP y registra el intento fallido en outbox con siguiente fecha de reintento y número de intentos. Asegura que una segunda ejecución del dispatcher no envía dos notificaciones con el mismo `event_id` cuando el proveedor admite clave de idempotencia; documenta el riesgo residual cuando no la admite.

**Pista:** ejecuta el dispatcher dos veces para el mismo `event_id` del outbox simulando que el primer intento quedó en un timeout ambiguo (no sabes si el correo salió o no); si el proveedor SMTP no te da una clave de idempotencia, verás que no puedes garantizar cero duplicados y debes documentar ese posible reenvío como riesgo residual aceptado, no intentar resolverlo con más reintentos.

#### Aplica

Añade una plantilla de correo de confirmación para el proyecto integrador de RutaFlow. Prueba caracteres acentuados, destinatario inválido, fallo SMTP y redacción de logs. Separa contenido de correo del método que confirma el pedido.

**Checklist de salida.**

- [ ] El proyecto declara la dependencia `mail` y lee host, puerto y credenciales de variables externas.
- [ ] `CorreoPedido` arma destinatario, asunto y texto con la referencia del pedido.
- [ ] Un test con `JavaMailSender` simulado captura `SimpleMailMessage` y no contacta SMTP.
- [ ] Un timeout simulado queda en outbox con próxima fecha de reintento y número de intentos.
- [ ] El dispatcher no duplica con el mismo `event_id` cuando el proveedor ofrece clave de idempotencia.
- [ ] El riesgo residual de reenvío está documentado cuando no existe esa clave.

**Si falla.** Si el test intenta contactar SMTP, el `JavaMailSender` no está sustituido o la configuración real se carga en el contexto. Si el mensaje llega sin referencia, revisa el armado o la plantilla. Si el timeout no deja registro, el envío no está pasando por outbox. Si el reintento duplica, el `event_id` no es estable o el dispatcher no confirma la marca de publicado.

Entrega implementación, test del mock y flujo de outbox/retry. **Cuándo no usarlo:** no envíes correo síncrono en la transacción HTTP crítica ni guardes contraseña en `application.yml` versionado.

**Errores comunes:** enviar el correo dentro de la misma transacción que confirma el pedido (si SMTP tarda o falla, arriesga revertir una operación de negocio que ya era válida), y reintentar un envío fallido sin registrar número de intentos ni próxima fecha de reintento, perdiendo la capacidad de distinguir un fallo transitorio de uno permanente.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 4: Caché con Spring Cache, Caffeine y Redis · Avanzado · 1 h 20 min

**Prerrequisito:** Tema 3 de este módulo y el entorno del stack instalado.

**Al terminar podrás:** cachear una lectura con Caffeine, invalidarla después de una escritura y explicar cuándo hace falta Redis.

#### Aprende

La lista de tarifas cambia poco y se consulta miles de veces por minuto.

**¿Por qué es importante?** Una caché puede reducir latencia y carga de base de datos, pero introduce copias que pueden quedar obsoletas.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@EnableCaching` y proveedor Caffeine | Prerrequisito | El checklist exige `@EnableCaching` activo y Caffeine con máximo de entradas y TTL. |
| `@Cacheable` con clave por `#zona` | Núcleo | `buscar(String zona)` cachea por `key = "#zona"` y dos llamadas producen una lectura. |
| Clave de caché bien formada | Diagnóstico | Si `NORTE` y `SUR` colisionan, la clave no diferencia por `#zona`. |
| `@CacheEvict` para invalidar | Núcleo | `actualizar` evita por `key = "#tarifa.zona"` y la siguiente búsqueda vuelve a leer. |
| Clave de evict desalineada | Error frecuente | Sin `@CacheEvict` el usuario recibe el valor viejo hasta expirar el TTL. |
| Caffeine local vs Redis compartido | Decisión | Una actualización en otra réplica no se ve con caché local: Redis o TTL corto son decisiones. |
| Cache stampede | Límite | El texto define el recálculo simultáneo de una clave expirada por muchas solicitudes. |

Cada fila tiene su explicación individual a continuación.

**`@EnableCaching` y proveedor Caffeine (Prerrequisito).** La abstracción se activa con `@EnableCaching` y el laboratorio usa Caffeine con un máximo de entradas y un TTL configurados. Sin `@EnableCaching` las anotaciones no surten efecto y la segunda lectura vuelve al repository. El proveedor define almacenamiento y expiración, por eso configurarlo es condición previa a medir hits y misses.

**`@Cacheable` con clave por `#zona` (Núcleo).** El método `buscar(String zona)` lleva `@Cacheable(cacheNames = "tarifas", key = "#zona")`, de modo que dos llamadas a `buscar("NORTE")` produzcan una sola lectura del repository. Reutilizar la respuesta por clave es el beneficio central de la caché. El test lo comprueba contando las llamadas reales al repositorio.

**Clave de caché bien formada (Diagnóstico).** La pista hace cachear `buscar("NORTE")` y `buscar("SUR")` y contar las llamadas reales por zona; si aparece una sola en total, la clave no está diferenciando por `#zona` y ambas colisionan. El diagnóstico es revisar que la expresión de clave incluya los parámetros que cambian el resultado, incluyendo tenant o locale cuando corresponda. Una clave mal formada mezcla datos de distintas entradas.

**`@CacheEvict` para invalidar (Núcleo).** El método `actualizar` usa `@CacheEvict(cacheNames = "tarifas", key = "#tarifa.zona")` para invalidar la entrada tras una escritura, de modo que la siguiente búsqueda vuelva a leer de la base. La invalidación es lo que mantiene la copia consistente con el original. El checklist verifica que actualizar borre la entrada correcta.

**Clave de evict desalineada (Error frecuente).** El fallo deliberado elimina `@CacheEvict` y muestra que el usuario recibe el valor viejo hasta que expira el TTL. El error relacionado es desalinear la clave de `@CacheEvict` respecto a la de `@Cacheable`, por ejemplo evictar por un formato distinto de `#tarifa.zona`, dejando entradas obsoletas que nunca se invalidan. Alinear ambas claves es lo que hace que la invalidación funcione.

**Caffeine local vs Redis compartido (Decisión).** Caffeine vive dentro de cada proceso; Redis comparte datos entre réplicas a costa de una dependencia de red y operación. El tema muestra que una actualización en otra réplica no se ve con caché local, y aclara que eso no es un error del test: Redis o un TTL corto son decisiones distintas. La elección se justifica por la consistencia aceptable y el coste operativo.

**Cache stampede (Límite).** El texto define el cache stampede como muchas solicitudes recalculando a la vez una clave recién expirada, lo que puede descargar la carga que la caché pretendía evitar. Es un límite a considerar al fijar TTL, tamaño y estrategia ante cache miss. Reconocerlo guía decisiones como refresco anticipado o bloqueo de recálculo, aunque el laboratorio solo lo nombra.

`@EnableCaching` activa la abstracción; `@Cacheable` reutiliza una respuesta por clave; `@CacheEvict` invalida entradas; `@CachePut` actualiza una entrada explícitamente. El proveedor define almacenamiento y expiración. Caffeine vive dentro de cada proceso; Redis comparte datos entre réplicas, a costa de una dependencia de red y operación.

La clave debe incluir parámetros que cambian el resultado, incluyendo tenant/locale cuando corresponda. Define TTL, invalidación, límites de tamaño y estrategia ante cache miss. Un cache stampede ocurre cuando muchas solicitudes recalculan simultáneamente una clave expirada.

**Analogía:** una caché es tener a mano, en el cajón del escritorio, los papeles que usas cada día en vez de bajar al archivo cada vez. Caffeine es ese cajón local (rápido, propio de cada oficina); Redis es un archivo compartido entre varias oficinas; y la expiración evita quedarte con una copia vieja cuando el original ya cambió.

#### Practica

Genera una app con `cache`; agrega Caffeine para el laboratorio.

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/tarifas/TarifaService.java` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/main/java/academia/tarifas/TarifaService.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

En `src/main/java/academia/tarifas/TarifaService.java`:

```java
@Service
public class TarifaService {
    private final TarifaRepository repository;

    public TarifaService(TarifaRepository repository) { this.repository = repository; }

    @Cacheable(cacheNames = "tarifas", key = "#zona")
    public Tarifa buscar(String zona) {
        return repository.findByZona(zona)
            .orElseThrow(() -> new IllegalArgumentException("Zona desconocida"));
    }

    @CacheEvict(cacheNames = "tarifas", key = "#tarifa.zona")
    public Tarifa actualizar(Tarifa tarifa) {
        return repository.save(tarifa);
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

Activa caching con `@EnableCaching` y configura Caffeine con máximo de entradas y TTL. Escribe un test que invoque dos veces `buscar("NORTE")` y verifique una llamada al repository, luego actualice y verifique que la siguiente búsqueda vuelve a leer. Ejecuta `./mvnw test -Dtest=TarifaServiceTest`.

**Resultado esperado:** la segunda lectura reutiliza la entrada y la escritura la invalida. **Fallo deliberado:** elimina `@CacheEvict`; actualiza tarifa y demuestra que el usuario recibe el valor viejo hasta expirar el TTL.

Mide hits, misses y tamaño con Actuator/Micrometer. Añade un test para dos zonas y confirma que no colisionan claves. Evalúa qué sucede si se actualiza la tarifa en otra réplica cuando usas caché local.

**Pista:** cachea `buscar("NORTE")` y `buscar("SUR")` y cuenta en el log del repository cuántas llamadas reales hizo cada una; si ves una sola llamada total en vez de dos, la clave del `@Cacheable` no está diferenciando por `#zona` y ambas zonas están colisionando en la misma entrada.

#### Aplica

Propón para el proyecto integrador de RutaFlow una caché de lectura de catálogo y otra de autorización. Para cada una define TTL, clave, invalidación, privacidad multi-tenant y comportamiento si Redis no responde. Implementa solo la caché con consistencia aceptable; deja otras consultas sin cachear justificadamente.

**Checklist de salida.**

- [ ] `@EnableCaching` está activo y Caffeine tiene máximo de entradas y TTL configurados.
- [ ] Dos llamadas a `buscar("NORTE")` producen una sola lectura del repository.
- [ ] Actualizar la tarifa invalida la entrada y la siguiente búsqueda vuelve a leer.
- [ ] Sin `@CacheEvict`, la prueba demuestra el valor viejo hasta que expira el TTL.
- [ ] Dos zonas distintas no colisionan en la misma clave de caché.
- [ ] Hits, misses y tamaño se miden, y la elección Caffeine vs Redis está justificada.

**Si falla.** Si la segunda lectura vuelve al repository, revisa `@EnableCaching` y que la llamada pase por el proxy. Si zonas distintas comparten entrada, la clave no incluye `#zona`. Si la escritura no invalida, la clave de `@CacheEvict` no coincide con la de `@Cacheable`. Si la actualización en otra réplica no se ve, estás usando una caché local: Redis o un TTL corto son decisiones distintas, no un error del test.

Entrega tests de hit/miss/invalidation, métrica y tabla de decisión Caffeine vs Redis. **Cuándo no usarlo:** no caches datos sensibles sin aislamiento de clave, datos que cambian constantemente sin invalidación ni resultados de consultas no deterministas.

Referencia: [Spring Boot — Task Execution and Scheduling](https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html), [Spring Framework — Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html), [Spring Framework — Email](https://docs.spring.io/spring-framework/reference/integration/email.html).

**Errores comunes:** desalinear la clave de `@CacheEvict` respecto a la de `@Cacheable` (por ejemplo, invalidar por `#tarifa.zona` cuando la lectura cachea por `#zona` con otro formato), dejando entradas obsoletas que nunca se invalidan, y usar Caffeine (caché local por proceso) en un despliegue con varias réplicas esperando que la invalidación en una instancia se propague a las demás sin pasar por Redis.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 5: @Async y ejecutores: trabajo en segundo plano con límites · Avanzado · 1 h 40 min

**Prerrequisito:** Temas 1 y 2 de este módulo y el módulo de concurrencia del track Java.

**Al terminar podrás:** ejecutar métodos en segundo plano con `@Async`, definir un ejecutor con límites explícitos, devolver `CompletableFuture` y diagnosticar por qué `@Async` a veces "no hace nada".

#### Aprende

Al registrar un envío, el backend de RutaFlow enviaba un SMS al destinatario y la petición tardaba lo que tardara el proveedor. Mover esa tarea a segundo plano es el caso real más común de `@Async`; hacerlo con un pool sin límites es la forma más común de tumbar el servidor en un pico de tráfico.

**¿Por qué es importante?** porque el trabajo en segundo plano mejora la latencia, pero sin límites ni manejo de errores provoca pérdidas silenciosas y caídas.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@EnableAsync` y proxy | Prerrequisito | Quitar `@EnableAsync` ejecuta los SMS en serie sin error y la prueba falla. |
| `@Async` con ejecutor nombrado | Núcleo | `@Async("notificaciones")` corre `enviarSms` en hilos `notif-1` a `notif-4`. |
| `ThreadPoolTaskExecutor` acotado | Núcleo | El bean fija core/max 4, `QueueCapacity(100)` y prefijo `notif-`. |
| `CompletableFuture` para combinar | Variante | El test une cuatro futuros con `allOf(...).join()` y exige menos de 1 000 ms. |
| Auto-invocación desde la misma clase | Error frecuente | Llamar `enviarSms` desde otro método del servicio corre síncrono; se ve en el nombre del hilo. |
| Excepciones de métodos `void` | Diagnóstico | Las excepciones de `void` no llegan a quien llama; se usa `AsyncUncaughtExceptionHandler`. |
| `@Async` no es durable | Límite | Si la tarea debe sobrevivir a un reinicio, se usa cola u outbox, no `@Async`. |

Cada fila tiene su explicación individual a continuación.

**`@EnableAsync` y proxy (Prerrequisito).** Con `@EnableAsync` Spring envuelve en un proxy los beans que tienen métodos `@Async` y entrega la llamada a un `Executor`. El fallo deliberado quita la anotación y los cuatro SMS se ejecutan uno tras otro en el hilo de la prueba, superando los 1 000 ms, sin error de compilación ni de arranque. La lección es que sin `@EnableAsync` la anotación `@Async` se ignora en silencio.

**`@Async` con ejecutor nombrado (Núcleo).** `enviarSms` lleva `@Async("notificaciones")`, por lo que corre en un hilo del pool indicado y no en el hilo de la petición. En el log aparecen los hilos `notif-1` a `notif-4`, que confirman la ejecución en paralelo. Nombrar el ejecutor liga el método al pool acotado correcto en vez de a uno por defecto ilimitado.

**`ThreadPoolTaskExecutor` acotado (Núcleo).** `AsyncConfig` declara un `ThreadPoolTaskExecutor` con `corePoolSize` y `maxPoolSize` en 4, `queueCapacity` 100 y `threadNamePrefix` `notif-`. Estos límites son el mecanismo que evita crear hilos sin tope y tumbar el servidor en un pico, el riesgo que el tema llama "infinitos carteros". Un pool con tamaño y cola definidos convierte la concurrencia en algo gobernado.

**`CompletableFuture` para combinar (Variante).** Como `enviarSms` devuelve `CompletableFuture<String>`, el test reúne cuatro envíos y los espera con `CompletableFuture.allOf(...).join()`, midiendo un tiempo cercano a 300 ms frente a los ~1 200 ms en serie. Devolver un futuro permite a quien llama esperar o combinar resultados, a diferencia de un método `void`. Es la variante que hace observable el paralelismo.

**Auto-invocación desde la misma clase (Error frecuente).** Como `@Async` funciona por proxy, una llamada desde la misma clase (`this.enviarSms()`) no pasa por el proxy y se ejecuta de forma síncrona. El tema pide agregar `enviarLote` que llame internamente a `enviarSms` y comparar `Thread.currentThread().getName()` para demostrarlo. Ver el hilo principal en lugar de `notif-` delata la auto-invocación.

**Excepciones de métodos `void` (Diagnóstico).** Las excepciones lanzadas por métodos `@Async` que devuelven `void` no llegan a quien llama, así que pueden perderse en silencio. El apartado "Aplica" exige configurar un `AsyncUncaughtExceptionHandler` para capturarlas, junto con una política de rechazo cuando la cola de 100 se llena. Sin ese handler, un fallo en segundo plano no deja rastro para diagnosticar.

**`@Async` no es durable (Límite).** `@Async` vive en la memoria del proceso: si la tarea debe sobrevivir a un reinicio o reintentarse, el tema manda usar una cola (Kafka, RabbitMQ) o un outbox. Al reiniciar, una tarea encolada en el ejecutor simplemente desaparece. Este límite marca la frontera entre aligerar una petición y garantizar que el trabajo se complete.

Con `@EnableAsync`, Spring envuelve los beans que tienen métodos `@Async` en un **proxy**: la llamada se entrega a un `Executor` y regresa de inmediato. Si el método devuelve `CompletableFuture`, quien llama puede esperar o combinar resultados. Un `ThreadPoolTaskExecutor` con tamaño y cola definidos pone límites. Como funciona con proxies, una llamada **desde la misma clase** (`this.enviarSms()`) no pasa por el proxy y se ejecuta de forma síncrona. Las excepciones de métodos `void` no llegan a quien llama.

**Analogía:** `@Async` es dejar la carta en el buzón en vez de llevarla tú; el ejecutor es el número de carteros: si hay infinitos, la oficina colapsa.

**Diagrama:**

```mermaid
sequenceDiagram
    participant T as Prueba
    participant P as Proxy de NotificacionService
    participant E as Ejecutor notif-
    T->>P: enviarSms(G-1..G-4)
    P->>E: encola 4 tareas
    P-->>T: 4 CompletableFuture
    E-->>T: completan en paralelo
```

**Conceptos clave:** `@EnableAsync`, `@Async`, proxy, `ThreadPoolTaskExecutor`, cola acotada, `CompletableFuture`, auto-invocación, excepciones no capturadas.

#### Practica

**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir spring-async && cd spring-async
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip
unzip -q app.zip
```

Crea `src/main/java/com/example/demo/AsyncConfig.java`:

```java
package com.example.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Pool acotado y con nombre: límites explícitos en vez de hilos ilimitados
    @Bean("notificaciones")
    public Executor notificaciones() {
        ThreadPoolTaskExecutor ejecutor = new ThreadPoolTaskExecutor();
        ejecutor.setCorePoolSize(4);
        ejecutor.setMaxPoolSize(4);
        ejecutor.setQueueCapacity(100);
        ejecutor.setThreadNamePrefix("notif-");
        ejecutor.initialize();
        return ejecutor;
    }
}
```

Crea `src/main/java/com/example/demo/NotificacionService.java`:

```java
package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class NotificacionService {
    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);

    // Se ejecuta en un hilo del pool "notificaciones", no en el hilo de la petición
    @Async("notificaciones")
    public CompletableFuture<String> enviarSms(String guia) throws InterruptedException {
        Thread.sleep(300);                          // simula la latencia del proveedor de SMS
        log.info("SMS de {} enviado en {}", guia, Thread.currentThread().getName());
        return CompletableFuture.completedFuture(guia);
    }
}
```

Crea `src/test/java/com/example/demo/NotificacionServiceTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class NotificacionServiceTest {

    @Autowired
    NotificacionService servicio;

    @Test
    void cuatroSmsEnParaleloTardanComoUno() throws Exception {
        Instant inicio = Instant.now();
        List<CompletableFuture<String>> envios = List.of(
                servicio.enviarSms("G-1"), servicio.enviarSms("G-2"),
                servicio.enviarSms("G-3"), servicio.enviarSms("G-4"));
        CompletableFuture.allOf(envios.toArray(CompletableFuture[]::new)).join();
        long ms = Duration.between(inicio, Instant.now()).toMillis();

        System.out.println("4 SMS en " + ms + " ms");
        assertThat(ms).isLessThan(1000);          // en serie serían unos 1200 ms
    }
}
```

**Ejecuta el ejemplo:**

```bash
./mvnw test
```

**Resultado esperado:**

```text
4 SMS en 312 ms
...
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

El tiempo exacto varía, pero queda cerca de 300 ms porque las cuatro tareas corren en paralelo en hilos llamados `notif-1` a `notif-4` (míralos en el log). En serie serían unos 1 200 ms.

**Fallo deliberado:** Quita `@EnableAsync` de `AsyncConfig`. No hay error de compilación ni de arranque, pero la prueba falla: los cuatro SMS se ejecutan uno tras otro en el hilo de la prueba y tardan más de 1 000 ms. Sin `@EnableAsync` la anotación `@Async` se ignora en silencio.

Llama `enviarSms` desde otro método de la misma clase `NotificacionService` y demuestra con el nombre del hilo en el log que esa llamada no fue asíncrona.

**Pista:** agrega `enviarLote(List<String> guias)` en el mismo servicio, llama desde ahí a `enviarSms` y compara `Thread.currentThread().getName()`.

#### Aplica

Configura un `AsyncUncaughtExceptionHandler` para los métodos `@Async` que devuelven `void` y una política de rechazo para cuando la cola de 100 se llene. Prueba ambos casos.

**Checklist de salida.**

- [ ] `AsyncConfig` declara `@EnableAsync` y un pool `notificaciones` con core/max 4, cola 100 y prefijo `notif-`.
- [ ] Cuatro SMS terminan en torno a 300 ms y la prueba exige menos de 1 000 ms.
- [ ] El log muestra los hilos `notif-1` a `notif-4`.
- [ ] Quitar `@EnableAsync` ejecuta los SMS en serie y la prueba falla.
- [ ] La llamada desde otro método de la misma clase se demuestra síncrona con el nombre del hilo.
- [ ] `AsyncUncaughtExceptionHandler` y la política de rechazo cubren `void` y cola llena.
- [ ] Las tareas que deben sobrevivir un reinicio se derivan a una cola u outbox, no a `@Async`.

**Si falla.** Si la prueba tarda más de 1 000 ms y el log repite el hilo principal, falta `@EnableAsync` o la llamada es una auto-invocación que no pasa por el proxy. Si los hilos no llevan el prefijo `notif-`, el bean del ejecutor no se llama `notificaciones` o no se inyecta. Si las excepciones de métodos `void` no aparecen, configura `AsyncUncaughtExceptionHandler`. Si la tarea desaparece al reiniciar, `@Async` no es durable: usa una cola o un outbox.

**Transferencia al proyecto integrador «Backend profesional de entregas»:** envía las notificaciones push de entregas con `@Async` y un ejecutor acotado, y registra las fallas.

Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.

**Cuándo no usarlo:** si la tarea debe sobrevivir a un reinicio o reintentarse, usa una cola de mensajes (Kafka, RabbitMQ) o un outbox: `@Async` vive en la memoria del proceso y se pierde si cae. Con Java 21+ también puedes evaluar hilos virtuales (`spring.threads.virtual.enabled`).

**Errores comunes:** olvidar `@EnableAsync` y no notarlo porque `@Async` se ignora en silencio sin error de compilación ni de arranque, y llamar a un método `@Async` desde otro método de la misma clase (auto-invocación) esperando que pase por el proxy, cuando en realidad se ejecuta de forma síncrona en el mismo hilo.

**Fuente oficial:** [Spring Framework: Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html), [Spring Boot: Task Execution](https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html).

## Ampliación de la página 28 del PDF

### Tema complementario: Integraciones empresariales, SOAP y fronteras de protocolo · Avanzado · 50 min

**Prerrequisito:** HTTP, XML y las capas del proyecto; Python para una demostración independiente de parsing.

**Al terminar podrás:** leer un contrato SOAP mínimo y separar transporte de lógica de negocio.

#### Aprende

**¿Por qué es importante?** Un socio de RutaFlow tiene SOAP y SFTP aunque la aplicación nueva use REST. REST describe una interfaz sobre recursos; SOAP define mensajes XML con Envelope, Header opcional, Body y Fault. SFTP transfiere archivos sobre SSH; no equivale a FTP ni a FTPS. SMTP transporta correo y no demuestra entrega al destinatario. Un adaptador traduce el contrato externo al dominio y conserva correlación, errores e idempotencia.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Estructura de un mensaje SOAP | Prerrequisito | El texto describe Envelope, Header opcional, Body y Fault del contrato. |
| Namespace vs prefijo | Núcleo | Buscar por URI: cambiar el prefijo `s` por `env` conservando el URI no altera el resultado. |
| Búsqueda por URI con `findtext` | Diagnóstico | `raiz.findtext("s:Body/r:ConsultarEnvio/r:id", namespaces=ns)` localiza `ENV-42`. |
| Versión SOAP 1.1 vs 1.2 | Límite | Cambiar el URI SOAP a 1.1 sin actualizar el contrato lanza `ValueError`. |
| Validación de id ausente | Error frecuente | Un id vacío debe rechazarse antes de traducir el mensaje. |
| Adaptador que separa transporte de negocio | Decisión | Dibujar adaptador SOAP → caso de uso → repositorio con límites, timeouts y Fault. |
| Límites del parser local | Límite | El literal local no valida WSDL, seguridad XML ni interoperabilidad real. |

Cada fila tiene su explicación individual a continuación.

**Estructura de un mensaje SOAP (Prerrequisito).** SOAP define mensajes XML con Envelope, Header opcional, Body y Fault, a diferencia de REST que describe una interfaz sobre recursos. El ejemplo construye un Envelope con un Body que contiene `ConsultarEnvio` e `id`. Conocer esta estructura es condición para leer el contrato antes de intentar traducirlo.

**Namespace vs prefijo (Núcleo).** El mecanismo central es que el namespace identifica el vocabulario XML por su URI y el prefijo visible puede cambiar sin cambiar el significado. La pista lo demuestra: renombrar el prefijo `s` por `env` conservando el URI deja la búsqueda funcionando. Confundir prefijo con namespace es el malentendido que el tema desmonta.

**Búsqueda por URI con `findtext` (Diagnóstico).** El código mapea los URIs en `ns` y usa `raiz.findtext("s:Body/r:ConsultarEnvio/r:id", namespaces=ns)` para extraer `ENV-42`. Si `findtext` devuelve `None`, el diagnóstico es que el URI del namespace no coincide con el documento o la ruta cambió. Buscar por URI, no por prefijo, es lo que hace robusta la extracción.

**Versión SOAP 1.1 vs 1.2 (Límite).** SOAP 1.1 y 1.2 usan namespaces y bindings diferentes, así que cambiar el URI SOAP a 1.1 sin actualizar el contrato hace que la búsqueda no encuentre el nodo y lance `ValueError`. El límite obliga a diagnosticar versión y URI antes de cambiar etiquetas a ciegas. Es un recordatorio de que la versión del protocolo es parte del contrato.

**Validación de id ausente (Error frecuente).** El código comprueba `if not id_envio: raise ValueError(...)` para impedir traducir un mensaje sin identificador. Si un id vacío pasa la validación, falta ese control explícito. Rechazar la ausencia de datos antes de seguir evita arrastrar un mensaje inválido hacia el dominio.

**Adaptador que separa transporte de negocio (Decisión).** El apartado "Aplica" pide dibujar el adaptador SOAP → caso de uso → repositorio y definir límites de tamaño, timeouts, Fault, autenticación y correlación. La decisión es traducir el contrato externo al dominio sin mezclar transporte y lógica de negocio. También distingue garantías por protocolo: SFTP exige verificar host key y fin de archivo, y SMTP no demuestra entrega al destinatario.

**Límites del parser local (Límite).** El ejercicio inspecciona XML confiable construido localmente y no es un servidor SOAP ni sustituye a Spring Web Services. Para XML externo haría falta un parser endurecido, schema y límites; este literal no valida WSDL, seguridad XML ni interoperabilidad real. Presentar un archivo enviado como proceso completado sería tratar HTTP 200 como éxito de negocio, un error que el tema advierte evitar.

**Analogía:** varios formularios pueden solicitar el mismo despacho, pero cada formulario necesita un traductor que valide sus campos. El namespace identifica el vocabulario XML; el prefijo puede cambiar sin cambiar el significado. SOAP 1.1 y 1.2 usan namespaces y bindings diferentes. WSDL describe operaciones y tipos; no inventes un endpoint a partir del nombre de una operación.

#### Practica

El siguiente ejemplo inspecciona XML confiable construido localmente; no es un servidor SOAP ni una sustitución de Spring Web Services.

Crea `soap_contrato.py` en una carpeta vacía:

```python
import xml.etree.ElementTree as ET

mensaje = '''<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
 xmlns:r="urn:rutaflow:entregas"><s:Body><r:ConsultarEnvio>
 <r:id>ENV-42</r:id></r:ConsultarEnvio></s:Body></s:Envelope>'''
ns = {"s": "http://www.w3.org/2003/05/soap-envelope", "r": "urn:rutaflow:entregas"}
# Buscar por URI de namespace; el prefijo visible no es la identidad.
raiz = ET.fromstring(mensaje)
id_envio = raiz.findtext("s:Body/r:ConsultarEnvio/r:id", namespaces=ns)
if not id_envio:
    raise ValueError("Falta id del envío en el contrato SOAP 1.2")
print(f"Consultar envío: {id_envio}")
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

```bash
mkdir -p practica-integraciones
python3 soap_contrato.py
```

Ejecuta desde la carpeta donde guardaste el archivo. **Salida esperada:** `Consultar envío: ENV-42`. Explicación por bloques: el documento declara vocabularios, el mapa de namespaces permite encontrar el identificador y la validación impide traducir un mensaje sin id.

**Fallo deliberado:** cambia el URI SOAP al de 1.1 sin actualizar el contrato: la búsqueda no encuentra el nodo y lanza ValueError. Diagnostica versión y URI antes de cambiar etiquetas a ciegas.

**Pista:** cambia `s` por `env` en la declaración y etiquetas conservando el URI; la búsqueda sigue funcionando. Cambia luego ENV-42 por un campo vacío y comprueba rechazo.

#### Aplica

Dibuja adaptador SOAP → caso de uso → repositorio del proyecto integrador Spring. Define límites de tamaño, timeouts, Fault, autenticación y correlación. Para SFTP verifica host key y finalización de archivo; para SMTP distingue aceptación del servidor y entrega. **Límites:** para XML externo emplea parser/configuración endurecidos, schema y límites; este parser de un literal local no valida WSDL, seguridad XML ni interoperabilidad real.

**Checklist de salida.**

- [ ] `soap_contrato.py` imprime `Consultar envío: ENV-42`.
- [ ] La búsqueda usa el URI del namespace y cambiar el prefijo `s` por `env` no altera el resultado.
- [ ] Cambiar el URI al de SOAP 1.1 produce un `ValueError` diagnosticable.
- [ ] Un identificador vacío se rechaza antes de traducir el mensaje.
- [ ] La tabla REST/SOAP/SFTP/SMTP distingue contratos y garantías de entrega.
- [ ] Los límites del parser local están documentados: no valida WSDL ni seguridad XML.

**Si falla.** Si `findtext` devuelve `None`, el URI del namespace no coincide con el documento o la ruta cambió. Si cambiar el prefijo rompe la búsqueda, el mapa está usando prefijos en lugar de URIs. Si un id vacío pasa la validación, falta el control explícito. Si el resultado se presenta como integración real, recuerda que el ejercicio no valida WSDL, seguridad XML ni interoperabilidad.

Entrega archivo, salida, fallo y tabla REST/SOAP/SFTP/SMTP con contratos y garantías. **Errores comunes:** confundir prefijo con namespace, tratar HTTP 200 como éxito de negocio, presentar un archivo enviado como proceso completado. El siguiente paso es integrar un WSDL autorizado y verificar contrato real.

**Fuente oficial:** [SOAP 1.2, W3C](https://www.w3.org/TR/soap12-part1/).

## Aplicación del material de referencia

### Tema 6: Spring AI: ChatClient y herramientas con autorización fuera del modelo · Avanzado · 1 h 30 min

**Prerrequisito:** Java, interfaces, Maven, JUnit y autorización por recurso. JDK 27 y Maven. Ejemplo independiente desde carpeta vacía, con Spring AI 2.0.2 y Spring Boot 4.0.9; no usa claves, pagos ni llamadas a un modelo externo.

**Al terminar podrás:** ejecutar ChatClient contra un modelo controlado y un callback real de herramienta que rechaza un envío ajeno.

#### Aprende

El asistente del proyecto integrador podría consultar el estado de una entrega.

**¿Por qué es importante?** Un modelo puede proponer una llamada, pero la aplicación decide si está autorizada. Añadir la instrucción «consulta solo mis envíos» al prompt no sustituye ese control.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Versiones Spring Boot 4.0.9 y Spring AI 2.0.2 | Prerrequisito | El `pom.xml` fija el parent 4.0.9, el BOM 2.0.2 y Java 27. |
| `ChatClient` sobre `ChatModel` sustituible | Núcleo | `ChatClient.builder(modeloControlado)` devuelve `Estado: creado` para `ENV-42`. |
| Herramienta `@Tool` y callback | Núcleo | `MethodToolCallbackProvider` expone el callback de `estado` como operación de lectura. |
| Autorización en el código de negocio | Decisión | El callback rechaza `ENV-ajeno` con excepción; la descripción de `@Tool` no autoriza. |
| Descripción de `@Tool` no es control | Error frecuente | Quitar la comprobación de `ENV-42` hace fallar la prueba de `ENV-ajeno`. |
| La salida del modelo no es identidad | Límite | La identidad viene de la sesión del servidor, no de un argumento propuesto por el modelo. |
| No se prueba la elección real de herramienta | Límite | Las pruebas pasan sin red; no se valida que un modelo real elija bien ni su facturación o latencia. |

Cada fila tiene su explicación individual a continuación.

**Versiones Spring Boot 4.0.9 y Spring AI 2.0.2 (Prerrequisito).** El `pom.xml` fija el parent `spring-boot-starter-parent` 4.0.9, importa el `spring-ai-bom` 2.0.2 y usa Java 27, condiciones que el checklist verifica. Si el proyecto no compila, el apartado "Si falla" manda revisar las versiones del BOM y del parent. Alinear estas versiones es el requisito previo para que el ejemplo sea reproducible sin claves ni proveedor externo.

**`ChatClient` sobre `ChatModel` sustituible (Núcleo).** `ChatClient.builder(modeloControlado).build()` construye mensajes para un `ChatModel` que aquí es un stub que comprueba haber recibido `ENV-42` y responde `Estado: creado`. Que el modelo sea sustituible permite probar la adaptación de mensajes sin llamar a un proveedor real. El test confirma que el prompt llega al modelo y que la respuesta se adapta a texto.

**Herramienta `@Tool` y callback (Núcleo).** El método `estado(String envioId)` se anota con `@Tool` y se expone mediante `MethodToolCallbackProvider`, que produce un único callback invocable con un JSON de argumentos. El callback traduce la petición en ejecución de código de la aplicación, que es el mecanismo central del tema. Es la frontera donde una propuesta del modelo se convierte en una llamada controlada.

**Autorización en el código de negocio (Decisión).** El callback real acepta `ENV-42` y lanza `IllegalArgumentException("Sin permiso")` con `ENV-ajeno`, porque la autorización vive en el código de negocio y no en el prompt ni en la descripción de la herramienta. El apartado "Aplica" refuerza la decisión sustituyendo el ID fijo por permisos inyectados desde una sesión de prueba. La identidad no debe aceptarse como argumento propuesto por el modelo.

**Descripción de `@Tool` no es control (Error frecuente).** El fallo deliberado quita la comprobación de `ENV-42` dentro de `estado` y entonces la prueba que exige excepción para `ENV-ajeno` falla. La lección es que la descripción de `@Tool` no ejecuta autorización por bien redactada que esté. Compensarlo escribiendo instrucciones en el prompt sería el mismo error desde otro ángulo.

**La salida del modelo no es identidad (Límite).** La salida del modelo no es una instrucción privilegiada ni una identidad: en una integración real la identidad viene de la sesión del servidor y se aplica en el servicio que ejecuta la herramienta. Confiar en argumentos como identidad es uno de los errores comunes que el tema lista. Este límite separa lo que el modelo propone de lo que el sistema autoriza.

**No se prueba la elección real de herramienta (Límite).** Las pruebas pasan sin red, que es lo esperado, pero el propio tema aclara que no se ha probado que un modelo real elija correctamente la herramienta ni se han medido facturación, latencia, streaming o recuperación del proveedor. Son controles distintos del adaptador y del callback. Reconocer este alcance evita presentar el ejercicio como evidencia del comportamiento de un LLM.

ChatClient construye mensajes para un ChatModel sustituible. Una herramienta es una función con contrato y argumentos; el callback traduce la petición en ejecución de código de la aplicación. La salida del modelo no es una instrucción privilegiada ni una identidad. En una integración real, la identidad viene de la sesión del servidor y se aplica en el servicio que ejecuta la herramienta.

**Analogía:** el modelo es quien propone una consulta al mostrador; el personal autorizado conserva las llaves. El límite es que la calidad del texto o la descripción de una herramienta no garantiza una decisión segura. Aquí probamos fronteras de software, no la precisión ni el comportamiento de un LLM.

#### Practica

Parte de una carpeta vacía y crea manualmente el proyecto Maven y su estructura de pruebas:

```bash
mkdir -p ejemplo-spring-ai/src/test/java/academia
cd ejemplo-spring-ai
```

Crea `pom.xml` con este contenido completo:
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion>
  <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>4.0.9</version><relativePath/></parent>
  <groupId>academia</groupId><artifactId>spring-ai-lab</artifactId><version>1</version>
  <properties><java.version>27</java.version></properties>
  <dependencyManagement><dependencies><dependency><groupId>org.springframework.ai</groupId><artifactId>spring-ai-bom</artifactId><version>2.0.2</version><type>pom</type><scope>import</scope></dependency></dependencies></dependencyManagement>
  <dependencies><dependency><groupId>org.springframework.ai</groupId><artifactId>spring-ai-client-chat</artifactId></dependency><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency></dependencies>
</project>
```

Crea `src/test/java/academia/ChatToolsTest.java` con este contenido completo:
```java
package academia;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class ChatToolsTest {
    static class Consulta {
        @Tool(description = "Consulta el estado del envío autorizado de esta sesión")
        public String estado(String envioId) {
            if (!"ENV-42".equals(envioId)) throw new IllegalArgumentException("Sin permiso");
            return "creado";
        }
    }
    @Test void chatClientUsaElModeloSustituible() {
        ChatModel modeloControlado = prompt -> {
            assertTrue(prompt.getInstructions().stream().anyMatch(m -> m.getText().contains("ENV-42")));
            return new ChatResponse(List.of(new Generation(new AssistantMessage("Estado: creado"))));
        };
        var client = ChatClient.builder(modeloControlado).build();
        assertEquals("Estado: creado", client.prompt().user("Consulta ENV-42").call().content());
    }
    @Test void callbackRealRespetaLaFronteraDeAutorizacion() {
        var callbacks = MethodToolCallbackProvider.builder().toolObjects(new Consulta()).build().getToolCallbacks();
        assertEquals(1, callbacks.length);
        assertTrue(callbacks[0].call("{\"envioId\":\"ENV-42\"}").contains("creado"));
        assertThrows(RuntimeException.class, () -> callbacks[0].call("{\"envioId\":\"ENV-ajeno\"}"));
    }
}
```

Ejecuta las dos pruebas desde `ejemplo-spring-ai`:

```bash
mvn test -Dtest=ChatToolsTest
```

**Resultado esperado:** dos pruebas correctas. Explica cada bloque: el modelo controlado comprueba que recibió ENV-42, ChatClient adapta la respuesta, @Tool expone una operación de lectura y el callback real rechaza ENV-ajeno. No se ha probado que un modelo real elija correctamente la herramienta: eso exige un proveedor, modelo y evaluación adicionales.

**Fallo deliberado:** quita la comprobación `ENV-42` dentro de `estado`. La prueba que exige excepción para ENV-ajeno falla. **Pista:** la descripción de @Tool no ejecuta autorización; restaura el control en el código de negocio.

#### Aplica

Sustituye el ID fijo por un conjunto de permisos inyectado desde una sesión de prueba. Comprueba dos identidades con permisos distintos sin aceptar la identidad como argumento propuesto por el modelo. Añade un límite de llamadas y un timeout para una herramienta remota.

**Checklist de salida.**

- [ ] El pom fija Spring Boot 4.0.9, Spring AI BOM 2.0.2 y Java 27.
- [ ] `ChatClient` con el modelo controlado recibe `ENV-42` y devuelve `Estado: creado`.
- [ ] `MethodToolCallbackProvider` expone un callback de la herramienta.
- [ ] El callback real acepta `ENV-42` y lanza excepción con `ENV-ajeno`.
- [ ] Quitar la comprobación de `ENV-42` hace fallar la prueba de `ENV-ajeno`.
- [ ] La autorización se aplica en el código de negocio, no en la descripción de `@Tool` ni en el prompt.
- [ ] Los límites están escritos: no se probó la elección real de herramienta, ni facturación, latencia o recuperación del proveedor.

**Si falla.** Si el proyecto no compila, revisa las versiones del BOM y del parent. Si el modelo controlado no recibe `ENV-42`, revisa cómo se construye el prompt. Si el callback acepta `ENV-ajeno`, la autorización desapareció del código de negocio: la descripción de `@Tool` no autoriza. Si las pruebas pasan sin red, es lo esperado: el ejercicio no llama a un proveedor externo.

El siguiente tema estudia qué documentos puede recibir el modelo para construir su contexto. **Errores comunes:** conceder herramientas de escritura sin confirmación de negocio, confiar en argumentos como identidad y registrar prompts con datos sensibles. **Límites y decisión de uso:** no se han instalado agentes externos ni probado facturación, latencia, streaming o recuperación del proveedor; son controles distintos del adaptador y del callback.

**Fuentes oficiales:** [ChatClient](https://docs.spring.io/spring-ai/reference/api/chatclient.html), [herramientas](https://docs.spring.io/spring-ai/reference/api/tools.html) y [compatibilidad de versiones](https://docs.spring.io/spring-ai/reference/getting-started.html).

## Aplicación del material de referencia

### Tema 7: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar · Avanzado · 1 h 10 min

**Prerrequisito:** colecciones Java, metadatos, pruebas y el proyecto Spring AI del tema anterior.

**Al terminar podrás:** comprobar que el contexto recuperado no contiene documentación de otra empresa y que una consulta sin evidencia devuelve una colección vacía.

#### Aprende

En el proyecto integrador dos empresas consultan políticas de reembolso. Una búsqueda relevante pero de la empresa equivocada sigue siendo una fuga.

**¿Por qué es importante?** La autorización se debe aplicar antes de enviar documentos al modelo, no después de ver su respuesta.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Flujo RAG: ingesta, índice, recuperación | Prerrequisito | El texto describe dividir con política de tamaño/solapamiento y construir contexto con referencias. |
| Filtro por tenant antes del contexto | Núcleo | `recuperar` filtra por `empresa` autorizada antes de seleccionar documentos. |
| Relevancia no es autorización | Límite | Un reembolso de la empresa B es relevante pero sigue siendo una fuga. |
| Recuperación léxica vs embeddings | Variante | El recuperador es léxico y didáctico; no simula embeddings ni búsqueda vectorial. |
| Ausencia de evidencia | Diagnóstico | Un término vacío o sin coincidencia devuelve `List.of()`. |
| Contenido recuperado como dato, no instrucción | Error frecuente | Un documento con instrucción maliciosa no debe cambiar permisos ni herramientas. |
| Evaluación de la fase vectorial | Decisión | Medir recuperación aparte de fidelidad y registrar modelo, topK, umbral y coste. |

Cada fila tiene su explicación individual a continuación.

**Flujo RAG: ingesta, índice, recuperación (Prerrequisito).** Un flujo RAG ingiere documentos, los divide con una política de tamaño y solapamiento, crea un índice, recupera fragmentos y construye contexto con referencias. Entender estas etapas es condición para ver dónde encaja el control de acceso. El ejercicio se concentra en la recuperación y en el contrato de aislamiento antes de pasar a embeddings reales.

**Filtro por tenant antes del contexto (Núcleo).** El método `recuperar` filtra el corpus por la `empresa` autorizada antes de seleccionar los documentos que irán al contexto. El primer test lo prueba: con documentos de A y B, devuelve un solo documento y comprueba que no contiene "secreto". Aplicar el filtro antes de construir contexto es el mecanismo central del tema.

**Relevancia no es autorización (Límite).** El tema advierte que una búsqueda relevante pero de la empresa equivocada sigue siendo una fuga: relevancia semántica no significa autorización ni verdad. Por eso usar la similitud como control de acceso es un error listado. Este límite obliga a separar "qué es pertinente" de "qué se tiene permiso para abrir".

**Recuperación léxica vs embeddings (Variante).** El recuperador es léxico y didáctico y el código comenta explícitamente que no simula embeddings ni búsqueda vectorial. La variante de producción conserva el mismo contrato de aislamiento pero usa un `VectorStore` y `QuestionAnswerAdvisor` de Spring AI. Si un test depende de embeddings, el diagnóstico es recordar que este ejercicio es léxico.

**Ausencia de evidencia (Diagnóstico).** El segundo test comprueba que un término vacío o un corpus sin coincidencia devuelven una colección vacía, nunca texto inventado. En la aplicación ese caso debe producir una respuesta explícita de insuficiencia en vez de fabricar documentos. Si una consulta sin evidencia devuelve texto, el recuperador está inventando o falta cubrir el caso.

**Contenido recuperado como dato, no instrucción (Error frecuente).** El apartado "Aplica" añade un documento autorizado con una instrucción maliciosa marcado como dato no confiable y pide una prueba que impida que ese texto cambie permisos o herramientas. Si el documento malicioso cambia permisos, el contenido recuperado se está tratando como instrucción en lugar de dato. Compensar quitando el filtro y añadiendo "ignora la empresa B" al prompt sería el mismo error.

**Evaluación de la fase vectorial (Decisión).** Para la fase con embeddings y proveedor reales, el tema manda registrar modelo de embeddings, dimensiones, versión del corpus, topK, umbral, IDs recuperados y coste, y medir recuperación por separado de la fidelidad de la respuesta. Cambiar de modelo o de particionado puede exigir reindexar y volver a evaluar. La decisión es qué métricas prueban la calidad antes de acreditar esa fase, que todavía no se certifica.

Un flujo RAG ingiere documentos, los divide con una política de tamaño/solapamiento, crea un índice, recupera fragmentos y construye contexto con referencias. Los embeddings representan contenido como vectores; un vector store busca por similitud y debe aplicar filtros de acceso. Relevancia semántica no significa autorización ni verdad.

**Analogía:** consultar una biblioteca exige tanto encontrar una sección relevante como tener permiso para abrir el expediente. El límite es que un texto que contiene una palabra puede ser irrelevante, contradictorio o malicioso. Por eso este primer ejercicio usa recuperación léxica explícita, sin llamarla búsqueda vectorial ni fingir que un stub equivale a embeddings reales.

#### Practica

Parte de una carpeta vacía y crea manualmente otro proyecto Maven, sin reutilizar archivos ya preparados:

```bash
mkdir -p ejemplo-rag/src/test/java/academia
cd ejemplo-rag
```

Crea `pom.xml` con este contenido completo:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion>
  <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>4.0.9</version><relativePath/></parent>
  <groupId>academia</groupId><artifactId>spring-rag-lab</artifactId><version>1</version>
  <properties><java.version>27</java.version></properties>
  <dependencyManagement><dependencies><dependency><groupId>org.springframework.ai</groupId><artifactId>spring-ai-bom</artifactId><version>2.0.2</version><type>pom</type><scope>import</scope></dependency></dependencies></dependencyManagement>
  <dependencies><dependency><groupId>org.springframework.ai</groupId><artifactId>spring-ai-client-chat</artifactId></dependency><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency></dependencies>
</project>
```

Crea `src/test/java/academia/RagScopeTest.java` con este contenido completo:
```java
package academia;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class RagScopeTest {
    // Recuperador léxico didáctico: no simula embeddings ni búsqueda vectorial.
    List<Document> recuperar(String empresaAutorizada, String termino, List<Document> corpus) {
        if (termino.isBlank()) return List.of();
        return corpus.stream()
            .filter(d -> empresaAutorizada.equals(d.getMetadata().get("empresa")))
            .filter(d -> d.getText().toLowerCase(java.util.Locale.ROOT)
                .contains(termino.toLowerCase(java.util.Locale.ROOT)))
            .limit(2).toList();
    }
    @Test void filtraAntesDeConstruirContexto() {
        var corpus = List.of(
            new Document("Reembolso: revisar comprobante", Map.of("empresa", "A")),
            new Document("Reembolso secreto de B", Map.of("empresa", "B")));
        var docs = recuperar("A", "reembolso", corpus);
        assertEquals(1, docs.size());
        assertFalse(docs.getFirst().getText().contains("secreto"));
        assertEquals("A", docs.getFirst().getMetadata().get("empresa"));
    }
    @Test void sinEvidenciaNoSeInventaContexto() {
        assertTrue(recuperar("A", "", List.of()).isEmpty());
        assertTrue(recuperar("A", "factura", List.of(new Document("GPS", Map.of("empresa", "A")))).isEmpty());
    }
}
```

Ejecuta las pruebas desde `ejemplo-rag`:

```bash
mvn test -Dtest=RagScopeTest
```

**Resultado esperado:** dos pruebas correctas. Explica cada bloque: Document conserva texto y metadatos, el tenant autorizado es una entrada confiable del servidor, se filtra antes de seleccionar contexto y se limita el número de resultados. El segundo test comprueba ausencia de evidencia; en la aplicación ese caso debe producir una respuesta explícita de insuficiencia, no inventar documentos.

Para una segunda fase con embeddings y proveedor reales, conserva este mismo contrato de aislamiento y usa un VectorStore y QuestionAnswerAdvisor de Spring AI. Registra modelo de embeddings, dimensiones, versión del corpus, topK, umbral, IDs recuperados y coste. Construye un conjunto de preguntas con documentos relevantes conocidos; mide recuperación por separado de fidelidad de respuesta. Cambiar de modelo o de particionado puede exigir reindexar y volver a evaluar.

**Fallo deliberado:** elimina el filtro por empresa. El primer test recibe también el documento secreto y falla. **Pista:** no lo compenses añadiendo «ignora la empresa B» al prompt; restaura el filtro antes de construir contexto.

#### Aplica

Añade un documento autorizado que incluya una instrucción maliciosa y marca su contenido como dato no confiable. Diseña una prueba que impida que ese texto cambie permisos o herramientas. Añade preguntas sin respuesta y documentos contradictorios: define cuándo abstenerse o pedir revisión.

**Checklist de salida.**

- [ ] El recuperador filtra por la empresa autorizada antes de seleccionar contexto.
- [ ] El corpus con documentos de A y B devuelve un solo documento y no contiene "secreto".
- [ ] Un término vacío o un corpus sin coincidencia devuelve una colección vacía.
- [ ] El número de resultados se limita a los documentos seleccionados.
- [ ] Quitar el filtro por empresa hace fallar el primer test.
- [ ] La fase con embeddings queda documentada con modelo, dimensiones, topK, umbral, IDs recuperados y coste.
- [ ] El texto no confiable y los documentos contradictorios tienen una prueba que impide cambiar permisos o herramientas.

**Si falla.** Si aparece el documento de B, el filtro por tenant no se aplicó antes de seleccionar contexto. Si una consulta sin evidencia devuelve texto, el recuperador está inventando o el test no cubre el caso. Si el test depende de embeddings, recuerda que este ejercicio es léxico: no simula búsqueda vectorial. Si el documento malicioso cambia permisos, el contenido recuperado se está tratando como instrucción en lugar de dato.

El siguiente paso exige ejecutar el índice vectorial real y evaluar el modelo; todavía no se acredita esa fase. **Errores comunes:** dar acceso al corpus entero, usar similitud como control de acceso y evaluar solo si la respuesta suena convincente. **Límites y decisión de uso:** estos tests validan contratos locales; no validan calidad semántica, resistencia completa a prompt injection ni cumplimiento regulatorio.

**Fuente oficial:** [Spring AI RAG y QuestionAnswerAdvisor](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html).
