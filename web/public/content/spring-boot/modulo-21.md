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
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

El servicio de envíos confirma un nuevo envío y el servicio de ruteo debe conocerlo sin que una llamada síncrona a ruteo bloquee la API. Kafka conserva registros en un tópico y permite que consumidores independientes lean el mismo evento.

**¿Por qué es importante?** El productor y los consumidores pueden desplegarse y escalarse por separado; a cambio, hay retraso, duplicados, reintentos y evolución de contratos que deben diseñarse.

#### Paso 3 · Teoría y modelo mental

Un **tópico** es un registro distribuido particionado. La **key** determina la partición, de modo que eventos con la misma key mantienen orden dentro de esa partición. Un **consumer group** reparte particiones entre sus instancias: dentro de un grupo un registro lo procesa una instancia; dos grupos distintos reciben cada uno su propia copia lógica del flujo.

Kafka almacena bytes; Spring Kafka transforma objetos mediante serializers/deserializers. Un offset es la posición de lectura de un grupo, no un acuse individual universal. El orden no se garantiza entre particiones. Más instancias consumidoras que particiones no aumentan el paralelismo de ese tópico.

El modelo mental: el tópico es un libro de eventos, la partición es una sección ordenada y el grupo de consumidores es un equipo que divide secciones entre trabajadores.
**Analogía:** un tópico de Kafka es como una cinta transportadora en un aeropuerto; el productor deja maletas en ella y el consumidor las recoge al otro extremo. La `key` es la etiqueta de destino que garantiza que todas las maletas del mismo vuelo salgan por la misma puerta, en orden.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/main/resources/application.yml` dentro.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```


En `src/main/resources/application.yml`, configura conexión y JSON:

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
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JsonDeserializer
        spring.json.value.default.type: academia.rutaflow.event.EnvioCreado
        spring.json.trusted.packages: academia.rutaflow.event
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


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

El productor usa el identificador de agregado como key:

```java
@Service
public class EnvioEventPublisher {
    private final KafkaTemplate<Object, Object> kafka;

    public EnvioEventPublisher(KafkaTemplate<Object, Object> kafka) {
        this.kafka = kafka;
    }

    public CompletableFuture<SendResult<Object, Object>> publicar(EnvioCreado evento) {
        return kafka.send("rutaflow.envio.creado", evento.envioId().toString(), evento);
    }
}
```

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

Publica un evento desde una prueba o un endpoint de laboratorio y confirma que el listener lo recibe. Ejecuta `./mvnw test`; para una prueba manual, inicia la app y publica un evento mediante `KafkaTemplate`. No uses `Thread.sleep()` como sincronización de tests: espera una condición con timeout.

**Resultado esperado:** el productor completa su futuro con metadata del tópico/partición y el grupo `rutaflow-ruteo` recibe el evento. **Fallo deliberado:** publica dos eventos con distintas keys y observa que no debes asumir orden global. Luego usa la misma key y verifica que ambos quedan en la misma partición.

#### Paso 5 · Práctica guiada

1. Crea tópico `rutaflow.envio.creado` con tres particiones y replica 1 en laboratorio; registra partición, offset y key al consumir.
2. Levanta dos instancias con el mismo `group-id`; observa el reparto de particiones. Levanta otra instancia con `group-id=rutaflow-notificaciones`; comprueba que ese grupo recibe los eventos por separado.
3. Cambia la key de `envioId` a `eventId`; predice qué orden deja de estar garantizado y verifica el resultado.
4. Añade un campo opcional al evento y prueba compatibilidad productor/consumidor antes de cambiar un campo existente. Mantén la evolución aditiva o versiona el contrato.
**Pista:** aplica un cambio cada vez y vuelve a ejecutar; si algo se rompe, el último cambio es el sospechoso.
#### Paso 6 · Práctica independiente

En el proyecto integrador de RutaFlow, publica eventos de asignación con `envioId` como key y separa los grupos `rutaflow-ruteo` y `rutaflow-notificaciones`. Entrega una prueba de contrato JSON, una prueba con dos instancias y evidencia de asignación por partición. Define qué ocurre con un evento antiguo cuando se despliega una nueva versión del consumidor.

#### Paso 7 · Cierre y evidencia

Entrega configuración local, contrato, productor, consumidor, test y tabla con tópico/key/particiones/grupo. **Cuándo no usarlo:** no introduzcas Kafka para una llamada interna sencilla que requiere respuesta inmediata; una API síncrona puede ser más clara. **Evidencia:** test sin pausas arbitrarias y registro de key, partición y offset.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** dar por hecho que el código funcionó sin leer la salida real, y copiar el ejemplo sin entender qué hace cada línea.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
**Evidencia de aprendizaje:** entrega la salida del Paso 4, el fallo diagnosticado en el Paso 5 y una explicación breve de la corrección.
### Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir un fallo transitorio de un mensaje inválido, limitar reintentos, enviar casos agotados a una DLT y evitar aplicar dos veces el mismo evento en la base de datos.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

El consumidor de ruteo puede guardar la proyección y caer antes de confirmar el offset. Kafka volverá a entregar el evento. También puede llegar un evento malformado que fallará en cada intento.

**¿Por qué es importante?** Los reintentos permiten recuperarse de fallos temporales, pero sin idempotencia pueden duplicar asignaciones, cargos o notificaciones.

#### Paso 3 · Teoría y modelo mental

La entrega normal del consumidor suele ser **al menos una vez**: el handler puede ejecutarse otra vez si el proceso cae entre el efecto y el commit del offset. `enable.idempotence` protege ciertas retransmisiones del productor, no hace atómica una escritura SQL del consumidor con el offset de Kafka.

Reintenta errores realmente transitorios con límite y pausa; un contrato inválido no se arregla esperando. Al agotar intentos, una DLT conserva el mensaje para inspección y replay controlado. La clave de idempotencia del consumidor es `eventId`, no el texto completo del mensaje ni el offset.
**Analogía:** "entrega al menos una vez" es como un repartidor insistente que vuelve hasta que firmes: a veces toca el timbre dos veces por el mismo paquete. La idempotencia es tu norma de "si ya recibí este pedido, no lo proceso de nuevo"; y la DLT (cola de mensajes muertos) es el estante donde se dejan los paquetes que, tras varios reintentos, nadie pudo entregar.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/main/resources/db/migration/V2__evento_procesado.sql` dentro.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/main/resources/db/migration/V2__evento_procesado.sql` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.


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

El servicio procesa el evento en una transacción de base de datos; `registrarSiNuevo` ejecuta:

```sql
insert into evento_procesado(event_id)
values (:eventId)
on conflict (event_id) do nothing;
```

Solo si la inserción afecta una fila, actualiza la proyección de ruteo, y ambas escrituras deben compartir la transacción. Si el update falla, también se revierte la marca inbox. El listener retorna normalmente solo cuando el servicio confirma; deja que el contenedor confirme el offset después. Prueba dos entregas del mismo `eventId`: el estado de negocio debe cambiar una vez.

**Resultado esperado:** un fallo transitorio agota el número configurado de intentos y el mensaje llega a DLT; dos entregas del mismo evento producen una sola actualización. **Fallo deliberado:** elimina la clave primaria de `evento_procesado` y reproduce un efecto duplicado al repetir el evento.

#### Paso 5 · Práctica guiada

Inyecta tres clases de fallo en tests: timeout simulado de base (retryable), payload inválido (no retryable) y excepción tras marcar el inbox pero antes de actualizar la proyección. Comprueba número de intentos, rollback y destino final. Construye un procedimiento de replay de DLT que conserve `eventId`, registre operador/motivo y tenga límite de mensajes.
**Pista:** aplica un cambio cada vez y vuelve a ejecutar; si algo se rompe, el último cambio es el sospechoso.
#### Paso 6 · Práctica independiente

Para el proyecto integrador de RutaFlow, define un panel de mensajes en DLT y métricas de consumer lag, tasa de reintentos y edad del mensaje más antiguo. Diseña un replay desde DLT en tópico temporal hacia el tópico original. Verifica que el inbox vuelve a evitar el efecto duplicado y que los eventos incompatibles no se reinyectan automáticamente.

#### Paso 7 · Cierre y evidencia

Entrega prueba de reintento, DLT, duplicado e inbox transaccional. **Cuándo no usarlo:** no afirmes “exactly once” para Kafka + base relacional sin un diseño que incluya ambos sistemas; no descartes silenciosamente mensajes fallidos. **Evidencia:** conteo de intentos, fila DLT y una sola mutación persistida.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** dar por hecho que el código funcionó sin leer la salida real, y copiar el ejemplo sin entender qué hace cada línea.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
### Tema 3: Outbox transaccional y flujo de negocio

#### Paso 1 · Objetivo y preparación

Al finalizar podrás evitar la ventana de pérdida entre confirmar el envío en PostgreSQL y publicar `EnvioCreado` en Kafka. Continúa con la tabla inbox y el tópico de los temas anteriores.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Si la API confirma la transacción SQL y se cae antes de `KafkaTemplate.send`, existe un envío sin evento. Si publica antes del commit SQL y luego la transacción revierte, el consumidor observa un envío que no existe.

**¿Por qué es importante?** La base de datos y Kafka son dos sistemas con commits independientes; una transacción local no cubre ambos por defecto.

#### Paso 3 · Teoría y modelo mental

El outbox guarda el cambio de negocio y el evento en la misma transacción SQL. Un dispatcher lee eventos pendientes, publica y marca confirmación. Si cae tras publicar y antes de marcar, publicará de nuevo: por eso el outbox se combina con inbox/idempotencia. El patrón cierra la ventana de pérdida, no elimina duplicados ni sustituye una política de retención y operación.
**Analogía:** el patrón outbox es como escribir la carta y meterla en la bandeja de salida dentro de la misma transacción que registra el pedido: si el pedido se guarda, la carta queda lista para enviar; si se cae, tampoco queda carta. Un proceso aparte recoge la bandeja y despacha, garantizando que el mensaje y el cambio de datos nunca se contradigan.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/main/resources/db/migration/V3__outbox_event.sql` dentro.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```


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

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


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

El dispatcher no debe envolver la espera de Kafka y la consulta de lote en una transacción larga; persiste la marca de publicación en una operación corta independiente.

Ejecuta `./mvnw test -Dtest=OutboxIntegrationTest`.

**Resultado esperado:** rollback de creación no deja evento; caída antes de publicar deja evento pendiente; caída después de publicar pero antes de marcar genera duplicado que inbox neutraliza. **Fallo deliberado:** ejecuta publicación directa después de guardar el envío y detén el proceso entre ambos pasos; comprueba que no hay registro duradero que permita recuperar el evento.

#### Paso 5 · Práctica guiada

Implementa primero un dispatcher de una instancia y pruebas de los tres puntos de caída. Luego considera múltiples instancias: reclama filas con lease o bloqueo `FOR UPDATE SKIP LOCKED` dentro de una transacción corta, libera/vence el lease tras crash y evita mantener bloqueos SQL mientras esperas Kafka. El diseño debe aceptar duplicados aun con reclamo distribuido.
**Fallo deliberado:** altera deliberadamente un valor o una línea del ejemplo para provocar un error; lee el mensaje y diagnostica la causa antes de revertirlo.
**Pista:** aplica un cambio cada vez y vuelve a ejecutar; si algo se rompe, el último cambio es el sospechoso.
#### Paso 6 · Práctica independiente

Construye en el proyecto integrador de RutaFlow la secuencia `API -> PostgreSQL (envio + outbox) -> dispatcher -> Kafka -> consumer group de ruteo -> PostgreSQL (inbox + proyección)`. Prueba que una caída de Kafka no pierde el evento, que el restart del dispatcher lo publica y que un replay no duplica el estado. Agrega alerta por edad de outbox pendiente y runbook para mensajes en DLT.

#### Paso 7 · Cierre y evidencia

Entrega diagrama de secuencia, esquema outbox/inbox, pruebas de caída, métricas y runbook. **Cuándo no usarlo:** para un proceso local sin integración duradera, un evento Spring local puede ser suficiente; outbox añade tablas, dispatcher, limpieza y operación. **Evidencia:** cada ventana de fallo probada y conciliación entre envíos, outbox y proyección.

Referencia: [Spring for Apache Kafka](https://docs.spring.io/spring-kafka/reference/), [Apache Kafka Documentation](https://kafka.apache.org/documentation/).
**Errores comunes:** dar por hecho que el código funcionó sin leer la salida real, y copiar el ejemplo sin entender qué hace cada línea.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
