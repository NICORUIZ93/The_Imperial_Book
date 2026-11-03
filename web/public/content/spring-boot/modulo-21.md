# Módulo 21: Apache Kafka con Spring Boot — eventos, consumidores y recuperación

## Aprende construyendo

Vas a recorrer un evento de envío desde una API hasta dos consumidores independientes. Empieza con el productor/consumidor más pequeño y después convierte el flujo en una integración durable con outbox, consumidor idempotente, reintentos y dead-letter topic (DLT). No se promete “exactly once” entre una base de datos y Kafka: se diseñan duplicados seguros y recuperación observable.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** publicar `EnvioCreado` con `KafkaTemplate`, usar el ID del envío como key y leerlo con `@KafkaListener`. Un test verifica el payload y la key.
- **Caso RutaFlow:** confirmar un envío y su evento en la misma transacción PostgreSQL; un dispatcher publica el outbox; el consumidor de ruteo actualiza una proyección con `event_id` único. Se prueba la caída entre cada paso, un reintento duplicado y un mensaje que termina en DLT.

El segundo ejemplo es una integración entre procesos y tiene más piezas porque la durabilidad requiere resolver fallos que un `send()` simple no puede cerrar.

### Tema 1: Productor, tópico, key y consumidor

#### Paso 1 · Objetivo y preparación

Al finalizar podrás levantar un broker Kafka local, publicar un evento JSON desde Spring Boot y consumirlo en un grupo. Necesitas JDK 25+, Maven, Spring Initializr con `Spring Web` y `Spring for Apache Kafka`, y Podman Compose o Docker Compose.

Crea `examples/spring-kafka-rutaflow/compose.yaml` con un nodo Kafka en modo KRaft:

```yaml
services:
  kafka:
    image: apache/kafka:3.9.1
    hostname: kafka
    ports:
      - "19092:19092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:19092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,EXTERNAL://localhost:19092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,EXTERNAL:PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_NUM_PARTITIONS: 3
```

Desde la raíz del repositorio, levanta y comprueba el broker:

```bash
podman compose -f examples/spring-kafka-rutaflow/compose.yaml up -d
podman compose -f examples/spring-kafka-rutaflow/compose.yaml ps
```

Kafka escucha en `localhost:19092`. En Docker Compose, el comando equivalente comienza con `docker compose`. El broker de un nodo es solo para el laboratorio: no ofrece tolerancia a la pérdida del nodo.
**Conocimiento previo:** Spring Boot M1 Tema 1 (Initializr), Spring Boot M2 Tema 1 (API/DTO) y Docker Compose o Podman Compose. Usa un JDK 25 y Maven Wrapper.
#### Paso 2 · Contexto y caso real

El servicio de envíos confirma un nuevo envío y el servicio de ruteo debe conocerlo sin que una llamada síncrona a ruteo bloquee la API. Kafka conserva registros en un tópico y permite que consumidores independientes lean el mismo evento.

**¿Por qué es importante?** El productor y los consumidores pueden desplegarse y escalarse por separado; a cambio, hay retraso, duplicados, reintentos y evolución de contratos que deben diseñarse.

#### Paso 3 · Teoría y modelo mental

Un **tópico** es un registro distribuido particionado. La **key** determina la partición, de modo que eventos con la misma key mantienen orden dentro de esa partición. Un **consumer group** reparte particiones entre sus instancias: dentro de un grupo un registro lo procesa una instancia; dos grupos distintos reciben cada uno su propia copia lógica del flujo.

Kafka almacena bytes; Spring Kafka transforma objetos mediante serializers/deserializers. Un offset es la posición de lectura de un grupo, no un acuse individual universal. El orden no se garantiza entre particiones. Más instancias consumidoras que particiones no aumentan el paralelismo de ese tópico.

El modelo mental: el tópico es un libro de eventos, la partición es una sección ordenada y el grupo de consumidores es un equipo que divide secciones entre trabajadores.
**Analogía:** un tópico de Kafka es como una cinta transportadora en un aeropuerto; el productor deja maletas en ella y el consumidor las recoge al otro extremo. La `key` es la etiqueta de destino que garantiza que todas las maletas del mismo vuelo salgan por la misma puerta, en orden.
#### Paso 4 · Demostración guiada

##### Subtema 1.1: Publicar un evento con su key · 10-15 min

**Contexto:** la key `envioId` mantiene los eventos del mismo envío en una partición.

**Hazlo tú:** trabaja en `examples/spring-kafka-rutaflow/`. El record ya está en `src/main/java/academia/rutaflow/event/EnvioCreado.java`; compara su contrato y la publicación en `EnvioEventPublisher.java` con este ejemplo.
En `examples/spring-kafka-rutaflow/src/main/resources/application.yml`, configura conexión y JSON:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:19092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      properties:
        enable.idempotence: true
    consumer:
      group-id: rutaflow-ruteo
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.value.default.type: academia.rutaflow.event.EnvioCreado
        spring.json.trusted.packages: academia.rutaflow.event
```

**Ejecuta el laboratorio reproducible** (desde `examples/spring-kafka-rutaflow/`; no requiere broker externo):

```bash
./mvnw -Dtest=EnvioEventPublisherTest test
```
El proyecto usa Spring Kafka y JSR-310 para serializar `Instant`; la configuración reproducible está en `src/main/resources/application.yml`.


`auto-offset-reset: earliest` aplica cuando el grupo aún no tiene un offset confirmado; no rebobina automáticamente un grupo ya existente. En producción, restringe paquetes deserializables y configura TLS/SASL desde secretos externos.

Define un contrato versionable en `src/main/java/academia/rutaflow/event/EnvioCreado.java`:

```java
package academia.rutaflow.event;

import java.time.Instant;
import java.util.UUID;

public record EnvioCreado(
    UUID eventId,
    UUID envioId,
    int version,
    Instant occurredAt,
    String referencia
) {}
```

##### Subtema 1.2: Recibir el evento en un consumer group · 5-10 min

**Contexto:** el grupo de ruteo lee el evento sin bloquear la petición que confirmó el envío. El listener del laboratorio está en `src/main/java/academia/rutaflow/event/RuteoListener.java`.

El productor usa el identificador de agregado como key:

**Resultado esperado:** el futuro devuelve metadata con tópico, partición y offset.

**Fallo deliberado:** usa `eventId` como key en vez de `envioId`. **Resultado del fallo:** eventos de un mismo envío pueden caer en particiones distintas. **Diagnóstico:** la key debe ser el identificador cuyo orden necesitas conservar.

**Entiende:** Kafka conserva orden por partición; la key decide a qué partición llega el registro.

Para este primer ejemplo, un consumidor registra la key y valida el evento:

```java
@Component
public class RuteoListener {
    @KafkaListener(topics = "rutaflow.envio.creado", groupId = "rutaflow-ruteo")
    public void alCrear(
            EnvioCreado evento,
            @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        if (!key.equals(evento.envioId().toString())) {
            throw new IllegalArgumentException("La key no corresponde al envío");
        }
        System.out.printf("Ruteo recibido: %s / %s%n", key, evento.referencia());
    }
}
```

**Resultado esperado:** el listener imprime `Ruteo recibido: <key> / <referencia>`.

**Fallo deliberado:** publica una key distinta de `evento.envioId()`. **Error esperado:** `IllegalArgumentException: La key no corresponde al envío`. **Diagnóstico:** el productor y consumidor no están de acuerdo sobre la identidad del agregado.

**Entiende:** el consumer group divide particiones entre instancias; grupos distintos reciben el flujo por separado.

La prueba `src/test/java/academia/rutaflow/event/EnvioEventPublisherTest.java` publica un evento y espera hasta 10 segundos por la recepción. No usa `Thread.sleep()` como sincronización.

**Resultado esperado:** el productor completa su futuro con metadata del tópico/partición y el grupo `rutaflow-ruteo` recibe el evento. **Fallo deliberado:** publica dos eventos con distintas keys y observa que no debes asumir orden global. Luego usa la misma key y verifica que ambos quedan en la misma partición.

#### Paso 5 · Práctica guiada

##### Subtema 1.3: Comprobar key, particiones y dos grupos · 10-15 min

**Contexto:** una key conserva orden dentro de una partición; dos grupos reciben copias independientes.


1. La configuración del laboratorio crea `rutaflow.envio.creado` con tres particiones; la prueba comprueba la partición, key y recepción por ambos grupos.
2. Compara `RuteoListener.java` (`rutaflow-ruteo`) con `NotificacionListener.java` (`rutaflow-notificaciones`); comprueba que cada grupo recibe el evento.
3. Cambia la key de `envioId` a `eventId`; predice qué orden deja de estar garantizado y verifica el resultado.
4. Añade un campo opcional al evento y prueba compatibilidad productor/consumidor antes de cambiar un campo existente. Mantén la evolución aditiva o versiona el contrato.
**Pista:** cambia la key de `envioId` a `eventId` en el productor y publica varios eventos del mismo envío; revisa en qué partición cae cada uno — si ya no caen todos en la misma partición, perdiste el orden garantizado entre eventos del mismo envío que `envioId` como key te daba.

**Resultado esperado:** la prueba recibe el mismo evento en las colas de ambos listeners con distintos `group-id`; las instancias de un mismo grupo comparten el trabajo del tópico.

**Fallo deliberado:** inicia dos consumidores de notificaciones con el mismo `group-id` de ruteo. **Resultado del fallo:** Kafka reparte entre ellos y no envía una copia a cada uno. **Diagnóstico:** cada servicio independiente necesita su propio group id.

**Entiende:** tópico comparte el registro; el group id define qué instancias comparten el trabajo.
#### Paso 6 · Práctica independiente

En el proyecto integrador de RutaFlow, publica eventos de asignación con `envioId` como key y separa los grupos `rutaflow-ruteo` y `rutaflow-notificaciones`. Entrega una prueba de contrato JSON, una prueba con dos instancias y evidencia de asignación por partición. Define qué ocurre con un evento antiguo cuando se despliega una nueva versión del consumidor.

#### Paso 7 · Cierre y evidencia

Entrega configuración local, contrato, productor, consumidor, test y tabla con tópico/key/particiones/grupo. **Cuándo no usarlo:** no introduzcas Kafka para una llamada interna sencilla que requiere respuesta inmediata; una API síncrona puede ser más clara. **Evidencia:** test sin pausas arbitrarias y registro de key, partición y offset.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** asumir que Kafka garantiza orden global entre tópicos o entre particiones distintas (solo lo garantiza dentro de una misma partición), y agregar más instancias consumidoras que particiones esperando más paralelismo, cuando las instancias sobrantes del mismo `group-id` simplemente quedan sin partición asignada.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
**Evidencia de aprendizaje:** entrega el log del consumidor mostrando partición, offset y key de cada evento recibido, el resultado de publicar con `envioId` como key frente a `eventId` (qué orden se mantiene o se pierde), y la evidencia de que dos `group-id` distintos reciben cada uno su propia copia del evento.
### Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir un fallo transitorio de un mensaje inválido, limitar reintentos, enviar casos agotados a una DLT y evitar aplicar dos veces el mismo evento en la base de datos.
**Conocimiento previo:** Spring Boot M21 Tema 1 (productor y consumidor Kafka), Spring Boot M3 Tema 1 (persistencia) y conceptos de transacción SQL.
#### Paso 2 · Contexto y caso real

El consumidor de ruteo puede guardar la proyección y caer antes de confirmar el offset. Kafka volverá a entregar el evento. También puede llegar un evento malformado que fallará en cada intento.

**¿Por qué es importante?** Los reintentos permiten recuperarse de fallos temporales, pero sin idempotencia pueden duplicar asignaciones, cargos o notificaciones.

#### Paso 3 · Teoría y modelo mental

La entrega normal del consumidor suele ser **al menos una vez**: el handler puede ejecutarse otra vez si el proceso cae entre el efecto y el commit del offset. `enable.idempotence` protege ciertas retransmisiones del productor, no hace atómica una escritura SQL del consumidor con el offset de Kafka.

Reintenta errores realmente transitorios con límite y pausa; un contrato inválido no se arregla esperando. Al agotar intentos, una DLT conserva el mensaje para inspección y replay controlado. La clave de idempotencia del consumidor es `eventId`, no el texto completo del mensaje ni el offset.
**Analogía:** "entrega al menos una vez" es como un repartidor insistente que vuelve hasta que firmes: a veces toca el timbre dos veces por el mismo paquete. La idempotencia es tu norma de "si ya recibí este pedido, no lo proceso de nuevo"; y la DLT (cola de mensajes muertos) es el estante donde se dejan los paquetes que, tras varios reintentos, nadie pudo entregar.
#### Paso 4 · Demostración guiada

##### Subtema 2.1: Limitar reintentos y enviar el fallo a DLT · 10-15 min

**Contexto:** una excepción transitoria puede recuperarse; una excepción repetida necesita destino visible y límite de intentos.
Los ejercicios de este tema agregan persistencia SQL, reintentos y DLT al laboratorio. Usa una base PostgreSQL y las dependencias JDBC, Flyway y Spring Kafka; el laboratorio Kafka básico de Tema 1 aún no implementa estos pasos.


Configura backoff corto para laboratorio y una DLT con el mismo número de particiones que el tópico original:

```java
@Bean
NewTopic enviosCreados() {
    return TopicBuilder.name("rutaflow.envio.creado")
        .partitions(3)
        .replicas(1)
        .build();
}

@Bean
NewTopic enviosCreadosDlt() {
    return TopicBuilder.name("rutaflow.envio.creado.DLT")
        .partitions(3)
        .replicas(1)
        .build();
}

@Bean
DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<Object, Object> kafka) {
    var recoverer = new DeadLetterPublishingRecoverer(kafka);
    return new DefaultErrorHandler(recoverer, new FixedBackOff(1_000L, 2));
}
```

**Resultado esperado:** tras el intento inicial y dos reintentos, un error agotado se publica en `rutaflow.envio.creado.DLT`.

**Fallo deliberado:** quita el límite de `FixedBackOff`. **Resultado del fallo:** el mensaje puede bloquear la partición con reintentos repetidos. **Diagnóstico:** limita reintentos y separa errores permanentes para recuperación manual.

**Entiende:** la DLT guarda el mensaje fallido para inspección; no lo repara automáticamente.

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


Con esta política se realizan dos reintentos después del intento inicial; en producción separa excepciones recuperables de permanentes y evita que un error de negocio se convierta en retry infinito.

Para la proyección PostgreSQL, en `src/main/resources/db/migration/V2__evento_procesado.sql` crea una tabla inbox y una restricción única:

```sql
create table evento_procesado (
    event_id uuid primary key,
    processed_at timestamptz not null default now()
);
```

##### Subtema 2.2: Deduplicar con una tabla inbox · 10-15 min

**Contexto:** Kafka puede volver a entregar un evento después de que el consumidor guardó el efecto y cayó antes del commit del offset.

El servicio procesa el evento en una transacción de base de datos; `registrarSiNuevo` ejecuta:

```sql
insert into evento_procesado(event_id)
values (:eventId)
on conflict (event_id) do nothing;
```

**Resultado esperado:** la primera entrega inserta una fila; la segunda entrega del mismo `eventId` no inserta otra.

**Fallo deliberado:** elimina la clave primaria de `event_id`. **Resultado del fallo:** las dos entregas pueden actualizar la proyección. **Diagnóstico:** la unicidad del inbox es la barrera persistente contra duplicados.

**Entiende:** inbox y actualización de negocio deben confirmarse en la misma transacción SQL.

Solo si la inserción afecta una fila, actualiza la proyección de ruteo, y ambas escrituras deben compartir la transacción. Si el update falla, también se revierte la marca inbox. El listener retorna normalmente solo cuando el servicio confirma; deja que el contenedor confirme el offset después. Prueba dos entregas del mismo `eventId`: el estado de negocio debe cambiar una vez.

**Resultado esperado:** un fallo transitorio agota el número configurado de intentos y el mensaje llega a DLT; dos entregas del mismo evento producen una sola actualización. **Fallo deliberado:** elimina la clave primaria de `evento_procesado` y reproduce un efecto duplicado al repetir el evento.

#### Paso 5 · Práctica guiada

##### Subtema 2.3: Probar reintento, rollback y DLT · 10-15 min

**Contexto:** tres fallos diferentes deben dejar evidencias distintas: nuevo intento, rollback completo o mensaje en DLT.

Inyecta tres clases de fallo en tests: timeout simulado de base (retryable), payload inválido (no retryable) y excepción tras marcar el inbox pero antes de actualizar la proyección. Comprueba número de intentos, rollback y destino final. Construye un procedimiento de replay de DLT que conserve `eventId`, registre operador/motivo y tenga límite de mensajes.
**Pista:** inyecta la excepción justo después del `insert ... on conflict do nothing` del inbox pero antes del `update` de la proyección, dentro de la misma transacción, y repite la entrega del evento; si la transacción no revierte ambas escrituras juntas, verás la fila en `evento_procesado` marcada como procesada sin que la proyección se haya actualizado nunca.

**Resultado esperado:** el payload inválido llega a DLT; el timeout hace el número limitado de reintentos; una excepción dentro de la transacción revierte inbox y proyección.

**Fallo deliberado:** confirma la marca inbox antes de actualizar la proyección. **Resultado del fallo:** el reintento considera procesado un evento cuyo cambio de negocio no ocurrió. **Diagnóstico:** ambas escrituras comparten una transacción SQL.

**Entiende:** DLT, reintento e idempotencia cubren fallos distintos y se verifican por separado.
#### Paso 6 · Práctica independiente

Para el proyecto integrador de RutaFlow, define un panel de mensajes en DLT y métricas de consumer lag, tasa de reintentos y edad del mensaje más antiguo. Diseña un replay desde DLT en tópico temporal hacia el tópico original. Verifica que el inbox vuelve a evitar el efecto duplicado y que los eventos incompatibles no se reinyectan automáticamente.

#### Paso 7 · Cierre y evidencia

Entrega prueba de reintento, DLT, duplicado e inbox transaccional. **Cuándo no usarlo:** no afirmes “exactly once” para Kafka + base relacional sin un diseño que incluya ambos sistemas; no descartes silenciosamente mensajes fallidos. **Evidencia:** conteo de intentos, fila DLT y una sola mutación persistida.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** confirmar el offset de Kafka antes de que termine la transacción SQL del consumidor (o fuera de esa transacción), perdiendo el evento si el proceso cae justo después, y tratar cualquier excepción como retryable sin separar un fallo transitorio de un payload inválido, lo que convierte un mensaje malformado en reintentos infinitos en vez de enviarlo a la DLT.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
### Tema 3: Outbox transaccional y flujo de negocio

#### Paso 1 · Objetivo y preparación

Al finalizar podrás evitar la ventana de pérdida entre confirmar el envío en PostgreSQL y publicar `EnvioCreado` en Kafka. Continúa con la tabla inbox y el tópico de los temas anteriores.
**Conocimiento previo:** Spring Boot M21 Temas 1–2 (Kafka, DLT e inbox) y Spring Boot M3 Tema 1 (JPA y transacción local).
#### Paso 2 · Contexto y caso real

Si la API confirma la transacción SQL y se cae antes de `KafkaTemplate.send`, existe un envío sin evento. Si publica antes del commit SQL y luego la transacción revierte, el consumidor observa un envío que no existe.

**¿Por qué es importante?** La base de datos y Kafka son dos sistemas con commits independientes; una transacción local no cubre ambos por defecto.

#### Paso 3 · Teoría y modelo mental

El outbox guarda el cambio de negocio y el evento en la misma transacción SQL. Un dispatcher lee eventos pendientes, publica y marca confirmación. Si cae tras publicar y antes de marcar, publicará de nuevo: por eso el outbox se combina con inbox/idempotencia. El patrón cierra la ventana de pérdida, no elimina duplicados ni sustituye una política de retención y operación.
**Analogía:** el patrón outbox es como escribir la carta y meterla en la bandeja de salida dentro de la misma transacción que registra el pedido: si el pedido se guarda, la carta queda lista para enviar; si se cae, tampoco queda carta. Un proceso aparte recoge la bandeja y despacha, garantizando que el mensaje y el cambio de datos nunca se contradigan.
#### Paso 4 · Demostración guiada

##### Subtema 3.1: Guardar el cambio y el evento juntos · 10-15 min

**Contexto:** PostgreSQL y Kafka no comparten un commit; registra primero el evento pendiente en la transacción local.
Los ejercicios de este tema extienden el laboratorio con PostgreSQL, Flyway, repositorios y un dispatcher recuperable. Ese proyecto completo todavía no está creado; el código de abajo especifica el comportamiento que se debe implementar y probar.

En `src/main/resources/db/migration/V3__outbox_event.sql`, agrega `outbox_event(event_id UUID PRIMARY KEY, aggregate_id UUID NOT NULL, event_type VARCHAR NOT NULL, payload TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, published_at TIMESTAMPTZ NULL, attempts INTEGER NOT NULL DEFAULT 0)`. En `src/main/java/academia/rutaflow/envio/CrearEnvioService.java`, inserta la fila `envio` y el payload de `EnvioCreado` dentro de **la misma** `@Transactional`; no publiques Kafka dentro de esa transacción.

```java
@Transactional
public UUID crear(String referencia) {
    Envio envio = envios.save(Envio.nuevo(referencia));
    EnvioCreado evento = new EnvioCreado(
        UUID.randomUUID(), envio.getId(), 1, clock.instant(), referencia);
    outbox.save(OutboxEvent.pendiente(evento));
    return envio.getId();
}
```

**Resultado esperado:** el envío y su fila outbox quedan confirmados juntos.

**Fallo deliberado:** publica directamente en Kafka dentro de este método y provoca rollback de PostgreSQL. **Resultado del fallo:** Kafka puede contener un evento para un envío inexistente. **Diagnóstico:** el commit de la base no revierte un envío al broker.

**Entiende:** escribe el cambio y el evento pendiente en la misma transacción local.

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


##### Subtema 3.2: Publicar y marcar después del ack · 10-15 min

**Contexto:** si Kafka no confirma, el evento debe seguir pendiente para un nuevo intento.

En `src/main/java/academia/rutaflow/outbox/OutboxDispatcher.java`, el dispatcher selecciona un lote pequeño de pendientes, envía cada evento usando `aggregate_id` como key y espera confirmación limitada del broker. Solo después marca `published_at` y confirma esa actualización SQL. Registra timeout/causa e incrementa `attempts`; no marques publicado antes del ack del broker.

```java
public void publicarPendientes() throws Exception {
    for (OutboxEvent evento : outbox.siguienteLote(50)) {
        EnvioCreado payload = objectMapper.readValue(
            evento.payload(), EnvioCreado.class);
        kafka.send("rutaflow.envio.creado", evento.aggregateId().toString(),
                payload)
            .get(5, TimeUnit.SECONDS);
        outbox.marcarPublicado(evento.eventId(), clock.instant());
    }
}
```

**Resultado esperado:** solo se marca `published_at` después de recibir ack de Kafka.

**Fallo deliberado:** mueve `marcarPublicado` antes de `kafka.send(...).get(...)`. **Resultado del fallo:** un timeout deja el evento marcado aunque nunca se haya publicado. **Diagnóstico:** espera el ack limitado y solo entonces guarda la marca.

**Entiende:** una caída después del ack y antes de guardar puede duplicar el evento; inbox lo hace seguro.

El dispatcher no debe envolver la espera de Kafka y la consulta de lote en una transacción larga; persiste la marca de publicación en una operación corta independiente.

Ejecuta `./mvnw test -Dtest=OutboxIntegrationTest`.

**Resultado esperado:** rollback de creación no deja evento; caída antes de publicar deja evento pendiente; caída después de publicar pero antes de marcar genera duplicado que inbox neutraliza. **Fallo deliberado:** ejecuta publicación directa después de guardar el envío y detén el proceso entre ambos pasos; comprueba que no hay registro duradero que permita recuperar el evento.

#### Paso 5 · Práctica guiada

##### Subtema 3.3: Recuperar un evento tras una caída · 10-15 min

**Contexto:** la caída después de publicar y antes de marcar puede duplicar el evento, por eso el inbox sigue siendo obligatorio.

Implementa primero un dispatcher de una instancia y pruebas de los tres puntos de caída. Luego considera múltiples instancias: reclama filas con lease o bloqueo `FOR UPDATE SKIP LOCKED` dentro de una transacción corta, libera/vence el lease tras crash y evita mantener bloqueos SQL mientras esperas Kafka. El diseño debe aceptar duplicados aun con reclamo distribuido.
**Pista:** levanta dos instancias del dispatcher sin `FOR UPDATE SKIP LOCKED` y haz que ambas corran `publicarPendientes()` al mismo tiempo sobre el mismo lote; si el mismo `event_id` se publica dos veces a Kafka desde instancias distintas, te falta el bloqueo de reclamo de filas — con `SKIP LOCKED` cada instancia se queda solo con las filas que la otra no tomó.

**Resultado esperado:** una caída deja la fila pendiente o produce un duplicado que el inbox neutraliza; no se pierde el evento.

**Fallo deliberado:** marca la fila publicada antes de contactar Kafka. **Resultado del fallo:** la caída entre la marca y el envío pierde el evento. **Diagnóstico:** el ack precede a la marca, y el dispatcher vuelve a leer pendientes al reiniciar.

**Entiende:** outbox resuelve la ventana de pérdida; inbox hace inocua la entrega repetida.
#### Paso 6 · Práctica independiente

Construye en el proyecto integrador de RutaFlow la secuencia `API -> PostgreSQL (envio + outbox) -> dispatcher -> Kafka -> consumer group de ruteo -> PostgreSQL (inbox + proyección)`. Prueba que una caída de Kafka no pierde el evento, que el restart del dispatcher lo publica y que un replay no duplica el estado. Agrega alerta por edad de outbox pendiente y runbook para mensajes en DLT.

#### Paso 7 · Cierre y evidencia

Entrega diagrama de secuencia, esquema outbox/inbox, pruebas de caída, métricas y runbook. **Cuándo no usarlo:** para un proceso local sin integración duradera, un evento Spring local puede ser suficiente; outbox añade tablas, dispatcher, limpieza y operación. **Evidencia:** cada ventana de fallo probada y conciliación entre envíos, outbox y proyección.

Referencia: [Spring for Apache Kafka](https://docs.spring.io/spring-kafka/reference/), [Apache Kafka Documentation](https://kafka.apache.org/documentation/).
**Errores comunes:** envolver la espera de `kafka.send(...).get(...)` dentro de la misma transacción SQL que consulta el lote pendiente, manteniendo bloqueos de base de datos mientras se espera al broker, y marcar `published_at` antes de recibir el ack de Kafka, perdiendo la garantía de que el evento realmente salió si el proceso cae justo después.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
