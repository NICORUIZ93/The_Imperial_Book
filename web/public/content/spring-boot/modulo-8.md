# Módulo 8: Mensajería — Kafka/RabbitMQ

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria, verificado contra un broker real (`@EmbeddedKafka` para Kafka, sin necesitar Docker; `RabbitMQContainer` de Testcontainers para RabbitMQ), para que "el evento se publicó y se consumió" sea comprobable, no solo descrito.


## Aprende construyendo

### Tema 1: Producers y consumers con Spring Kafka

#### Paso 1 · Objetivo y preparación

Al finalizar podrás publicar un evento con `KafkaTemplate` y consumirlo con `@KafkaListener`, confirmando con un broker Kafka real (embebido, sin Docker) que el desacoplamiento entre publicador y consumidor funciona de extremo a extremo.

**Conocimiento previo:** `@Service` e inyección de dependencias (Módulo 1); manejo global de excepciones (Módulo 2).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La asignación de un conductor y el envío de notificaciones no deben bloquear el request HTTP que crea una tarea; un evento desacopla al publicador de sus consumidores, permitiendo que la notificación se procese de forma independiente sin que el creador de la tarea espere por ella.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** desacoplamiento vía topic, `@KafkaListener`.

```java
@Service
public class EventoPublisher {
    private final KafkaTemplate<String, TareaCreadaEvent> kafka;

    void publicar(TareaCreadaEvent evento) {
        kafka.send("tareas.creadas", evento);
    }
}
```

Este publicador envía un evento hacia un topic sin que el publicador conozca ni le importe quién está consumiendo ese evento.

```java
@KafkaListener(topics = "tareas.creadas", groupId = "notificaciones")
public void escuchar(TareaCreadaEvent evento) {
    // procesar notificación
}
```

Este listener define un consumidor completamente independiente, sin ninguna dependencia directa entre ambos. Sin mensajería, `TareaService` tendría que invocar directamente a `NotificacionService`, requiriendo que ambos estén disponibles simultáneamente.

**Analogía:** la mensajería es publicar un anuncio en un tablón público en vez de llamar personalmente a cada interesado: quien publica no necesita saber quién lo leerá, y se pueden agregar nuevos lectores sin que el publicador original haga nada distinto.

**Diagrama:**

```mermaid
flowchart LR
  A["TareaService.crear(...)"] --> B["EventoPublisher.publicar(evento)"]
  B --> C["topic: tareas.creadas"]
  C --> D["@KafkaListener groupId=notificaciones"]
  C --> E["@KafkaListener groupId=analytics (futuro, sin tocar el publicador)"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-spring`, o créala con `mkdir -p academia-spring` si es tu primera vez), genera el proyecto con Spring Initializr real (`web`, `kafka`) y crea el evento, el publicador y el consumidor en `src/main/java/com/academia/mensajeria/`:

```bash
mkdir -p academia-spring/src/main/java/com/academia/mensajeria
cd academia-spring
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,kafka -d javaVersion=25 -d artifactId=academia-mensajeria -o app.zip
unzip -o app.zip
```

```java
// src/main/java/com/academia/mensajeria/TareaCreadaEvent.java
package com.academia.mensajeria;

import java.io.Serializable;

public record TareaCreadaEvent(String id, String titulo) implements Serializable {}
```

```java
// src/main/java/com/academia/mensajeria/EventoPublisher.java
package com.academia.mensajeria;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventoPublisher {
    private final KafkaTemplate<String, TareaCreadaEvent> kafka;

    public EventoPublisher(KafkaTemplate<String, TareaCreadaEvent> kafka) { this.kafka = kafka; }

    public void publicar(TareaCreadaEvent evento) {
        kafka.send("tareas.creadas", evento.id(), evento); // clave estable: mismo id -> misma partición
    }
}
```

```java
// src/main/java/com/academia/mensajeria/NotificacionListener.java
package com.academia.mensajeria;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

@Component
public class NotificacionListener {
    // lista real (no un mock) donde el listener registra cada evento recibido, consultada por el test
    private final List<TareaCreadaEvent> eventosRecibidos = new CopyOnWriteArrayList<>();

    @KafkaListener(topics = "tareas.creadas", groupId = "notificaciones")
    public void escuchar(TareaCreadaEvent evento) {
        eventosRecibidos.add(evento);
    }

    public List<TareaCreadaEvent> getEventosRecibidos() { return eventosRecibidos; }
}
```

**Explicación línea por línea:** `kafka.send("tareas.creadas", evento.id(), evento)` publica usando el `id` de la tarea como clave, garantizando que eventos de la misma tarea siempre lleguen a la misma partición y por lo tanto se procesen en orden entre sí; `@KafkaListener(topics = "tareas.creadas", groupId = "notificaciones")` registra un consumidor independiente que Spring invoca automáticamente por cada mensaje del topic; `eventosRecibidos` es una lista real (no un mock) que el test consulta directamente para confirmar qué llegó efectivamente al consumidor.

Confirma con `@EmbeddedKafka` (un broker Kafka REAL que corre embebido dentro del proceso de test, sin necesitar Docker ni un Kafka externo) que un evento publicado efectivamente llega al consumidor:

```java
// src/test/java/com/academia/mensajeria/EventoPublisherTest.java
package com.academia.mensajeria;

import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.TestPropertySource;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = "tareas.creadas")
@TestPropertySource(properties = "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}")
class EventoPublisherTest {

    @Autowired
    private EventoPublisher publisher;
    @Autowired
    private NotificacionListener listener;

    @Test
    void publicarUnEventoLoEntregaAlConsumidorReal() {
        publisher.publicar(new TareaCreadaEvent("1", "Comprar leche"));

        // el consumo es asíncrono: espera activamente (con timeout real) a que el listener lo reciba
        Awaitility.await().atMost(Duration.ofSeconds(5))
            .untilAsserted(() -> assertThat(listener.getEventosRecibidos())
                .extracting(TareaCreadaEvent::titulo)
                .contains("Comprar leche"));
    }
}
```

```bash
mvn test -Dtest=EventoPublisherTest # Maven
./gradlew test --tests EventoPublisherTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: `@EmbeddedKafka` levantó un broker Kafka real dentro del proceso de test, `EventoPublisher` publicó de verdad hacia el topic `tareas.creadas`, y `NotificacionListener` —un consumidor completamente independiente, sin ninguna referencia directa al publicador— lo recibió y registró, confirmando el desacoplamiento real entre ambos.

**Fallo deliberado:** cambia el topic en `@KafkaListener(topics = "tareas.creadas", ...)` a `@KafkaListener(topics = "tareas.otro-topic", ...)` (un topic distinto al que `EventoPublisher` realmente publica) y ejecuta de nuevo. El test FALLA con un timeout de `Awaitility` (`ConditionTimeoutException`, tras esperar los 5 segundos completos sin que la condición se cumpla nunca) porque el consumidor está escuchando un topic que nunca recibe ningún mensaje — diagnostica confirmando que el acoplamiento entre publicador y consumidor, aunque no sea de compilación, SÍ existe implícitamente a través del nombre del topic: si ambos no coinciden exactamente en ese string, el desacoplamiento se convierte en una desconexión silenciosa sin ningún error de compilación que lo señale. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo `@KafkaListener` con un `groupId` distinto escuchando el mismo topic, y confirma con el test que AMBOS reciben el mismo evento de forma independiente.
2. Publica dos eventos con la misma clave (`evento.id()`) y confirma, inspeccionando el orden en `eventosRecibidos`, que llegan en el mismo orden en que se publicaron (garantía de orden por partición cuando comparten clave).
3. Publica un evento con un `id` nulo o vacío y observa (documentando el resultado) si eso afecta a qué partición se enruta, comparado con un `id` no vacío.
4. Escribe de memoria (sin mirar) un `EventoPublisher` con `KafkaTemplate`, un `@KafkaListener` independiente, y un test `@EmbeddedKafka` con `Awaitility` que confirme la entrega. Compara después contra el patrón del Paso 4.

**Pista:** el consumo de Kafka es inherentemente asíncrono; un test que verifica el resultado inmediatamente después de `publicar(...)` sin ningún mecanismo de espera (como `Awaitility`) es una fuente clásica de tests intermitentes (flaky), porque el consumidor podría no haber procesado el mensaje todavía en ese instante exacto.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para registrar el consumidor sobre el topic correcto:

```java
@____(topics = "tareas.creadas", groupId = "notificaciones")
public void escuchar(TareaCreadaEvent evento) { }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un publicador con `KafkaTemplate`, un consumidor con `@KafkaListener`, y un test `@EmbeddedKafka` que confirme la entrega con `Awaitility`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya publicas y consumes eventos desacoplados con Kafka, confirmando con un broker real embebido que la entrega efectivamente ocurre de extremo a extremo. El siguiente tema aborda qué ocurre cuando el consumidor falla al procesar un mensaje. Fuente oficial: [Spring for Apache Kafka — Testing](https://docs.spring.io/spring-kafka/reference/testing.html).

**Errores comunes:** asumir que el consumo es sincrónico y verificar el resultado sin ningún mecanismo de espera, produciendo tests intermitentes; que publicador y consumidor no coincidan exactamente en el nombre del topic, una desconexión silenciosa sin error de compilación.

**Cuándo no usarlo:** para una operación que el llamador necesita confirmar que se completó exitosamente antes de continuar (por ejemplo, verificar el stock disponible antes de confirmar una compra), una llamada síncrona directa es más apropiada que un evento asíncrono desacoplado.

Los producers y consumers de Spring Kafka que implementes aquí son los que integrará el proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 2: Dead-letter queue

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar reintentos limitados y una dead-letter queue para mensajes que fallan repetidamente, confirmando con un broker real que el mensaje problemático termina exactamente ahí, sin bloquear los mensajes siguientes.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un mensaje con un payload corrupto o una condición que el consumidor no puede manejar no debería bloquear indefinidamente el procesamiento de todos los mensajes válidos que llegan después de él en la misma partición.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** reintentos limitados, destino final para mensajes que fallan repetidamente.

```java
@Bean
DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template);
    return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3));
}
```

Este bean configura reintentos limitados (3, con 1 segundo entre cada uno); si todos fallan, el mensaje se redirige automáticamente a una dead-letter queue (por convención, el mismo nombre del topic original con el sufijo `.DLT`), en vez de perderse silenciosamente o bloquear los mensajes siguientes.

**Analogía:** una dead-letter queue es una bandeja separada de correspondencia no entregable en una oficina de correos, donde las cartas que no pudieron entregarse tras varios intentos se archivan para investigación manual, en vez de bloquear indefinidamente el resto de la correspondencia normal.

**Diagrama:**

```mermaid
flowchart LR
  A[mensaje llega al consumidor] --> B{"¿procesa exitosamente?"}
  B -->|sí| C[continúa con el siguiente mensaje]
  B -->|no, reintento 1/2/3| B
  B -->|agotados los 3 reintentos| D["publicado en tareas.creadas.DLT"]
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez) y crea la configuración de manejo de errores en `src/main/java/com/academia/mensajeria/`:

```bash
mkdir -p academia-spring/src/main/java/com/academia/mensajeria
cd academia-spring
```

```java
// src/main/java/com/academia/mensajeria/KafkaErrorConfig.java
package com.academia.mensajeria;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
public class KafkaErrorConfig {

    @Bean
    DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
        var recoverer = new DeadLetterPublishingRecoverer(template);
        return new DefaultErrorHandler(recoverer, new FixedBackOff(100L, 2)); // 2 reintentos rápidos para el test
    }
}
```

```java
// src/main/java/com/academia/mensajeria/ListenerConFalloDeliberado.java
package com.academia.mensajeria;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class ListenerConFalloDeliberado {

    @KafkaListener(topics = "pedidos.procesar", groupId = "procesador")
    public void procesar(String payload) {
        if (payload.equals("payload-invalido")) {
            throw new IllegalArgumentException("no se puede procesar: " + payload);
        }
        // procesamiento normal para cualquier otro payload
    }
}
```

**Explicación línea por línea:** `FixedBackOff(100L, 2)` declara 2 reintentos con 100ms entre cada uno (valores reducidos deliberadamente para que el test corra rápido); `ListenerConFalloDeliberado.procesar` lanza una excepción real de forma controlada para un payload específico, simulando un mensaje que el consumidor genuinamente no puede procesar; `DeadLetterPublishingRecoverer` intercepta esa excepción después de agotados los reintentos y republica el mensaje original en `pedidos.procesar.DLT`.

Confirma con `@EmbeddedKafka` que el mensaje inválido termina en la DLQ tras agotar los reintentos, mientras un mensaje válido posterior se procesa normalmente sin bloquearse:

```java
// src/test/java/com/academia/mensajeria/DeadLetterQueueTest.java
package com.academia.mensajeria;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.context.TestPropertySource;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"pedidos.procesar", "pedidos.procesar.DLT"})
@TestPropertySource(properties = "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}")
class DeadLetterQueueTest {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    @Test
    void unMensajeInvalidoTerminaEnLaDeadLetterQueue() {
        kafkaTemplate.send("pedidos.procesar", "payload-invalido");

        Map<String, Object> configs = KafkaTestUtils.consumerProps("grupo-verificacion-dlq", "true", embeddedKafkaBroker);
        try (Consumer<String, String> consumidorDlq = new org.apache.kafka.clients.consumer.KafkaConsumer<>(
                configs, new org.apache.kafka.common.serialization.StringDeserializer(), new org.apache.kafka.common.serialization.StringDeserializer())) {
            embeddedKafkaBroker.consumeFromAnEmbeddedTopic(consumidorDlq, "pedidos.procesar.DLT");

            ConsumerRecord<String, String> registroEnDlq = KafkaTestUtils.getSingleRecord(consumidorDlq, "pedidos.procesar.DLT", Duration.ofSeconds(10));

            assertThat(registroEnDlq.value()).isEqualTo("payload-invalido");
        }
    }
}
```

```bash
mvn test -Dtest=DeadLetterQueueTest # Maven
./gradlew test --tests DeadLetterQueueTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: el mensaje `"payload-invalido"` se reintenta 2 veces (falla ambas), y `DeadLetterPublishingRecoverer` lo republica automáticamente en `pedidos.procesar.DLT`, donde el consumidor de verificación del test lo lee directamente desde ese topic real — confirmando que el mensaje problemático quedó aislado y trazable, no perdido.

**Fallo deliberado:** quita el `@Bean errorHandler` completo de `KafkaErrorConfig` (dejando el manejo de errores por defecto de Spring Kafka, sin DLQ configurada) y ejecuta de nuevo el test. El test FALLA con timeout en `KafkaTestUtils.getSingleRecord(...)` porque ningún mensaje llega a `pedidos.procesar.DLT` — sin el `errorHandler` explícito, el mensaje fallido se reintenta indefinidamente con la política por defecto, o se descarta según la configuración implícita, pero en cualquier caso NUNCA llega a la DLQ que el test espera — diagnostica confirmando que la dead-letter queue no es un comportamiento automático de Kafka, sino algo que debe configurarse explícitamente con un `DefaultErrorHandler` y un `DeadLetterPublishingRecoverer`. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Publica un mensaje válido inmediatamente después del inválido en el mismo test, y confirma que el mensaje válido se procesa sin ningún retraso causado por los reintentos del mensaje anterior (los reintentos son por mensaje individual, no bloquean toda la partición indefinidamente en este patrón).
2. Aumenta `FixedBackOff(100L, 2)` a `FixedBackOff(100L, 0)` (cero reintentos) y confirma que el mensaje llega a la DLQ inmediatamente tras el primer fallo, sin ningún reintento.
3. Inspecciona los headers del `ConsumerRecord` recibido en la DLQ (`registroEnDlq.headers()`) y documenta qué información adicional sobre la excepción original Spring Kafka adjunta automáticamente.
4. Escribe de memoria (sin mirar) un `DefaultErrorHandler` con `DeadLetterPublishingRecoverer`, y un test que confirme que un mensaje fallido termina en el topic `.DLT` correspondiente. Compara después contra el patrón del Paso 4.

**Pista:** el sufijo `.DLT` (Dead Letter Topic) es la convención por defecto de `DeadLetterPublishingRecoverer`; puede personalizarse, pero mantener la convención por defecto facilita que cualquier desarrollador del equipo sepa dónde buscar mensajes fallidos sin necesitar documentación adicional.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para configurar 3 reintentos con 1 segundo entre cada uno antes de enviar a la DLQ:

```java
return new DefaultErrorHandler(recoverer, new ____(1000L, 3));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `DefaultErrorHandler` con reintentos limitados y `DeadLetterPublishingRecoverer`, y un test que confirme el mensaje fallido en la DLQ. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya configuras reintentos limitados y una dead-letter queue real, confirmando con un broker Kafka embebido que un mensaje problemático queda aislado y trazable sin bloquear el flujo normal. El siguiente tema profundiza en productores idempotentes y transacciones para evitar duplicados, el requisito de nivel profesional que la DLQ por sí sola no resuelve. Fuente oficial: [Spring for Apache Kafka — Dead Letters](https://docs.spring.io/spring-kafka/reference/retrytopic.html).

**Errores comunes:** no configurar ninguna dead-letter queue, arriesgando que un mensaje problemático bloquee o se pierda silenciosamente; no monitorear ni asignar dueño a la DLQ, dejando mensajes fallidos acumulándose sin que nadie los investigue.

**Cuándo no usarlo:** para un consumidor donde CUALQUIER fallo de procesamiento debe detener inmediatamente todo el flujo hasta que un humano intervenga (un escenario donde continuar procesando otros mensajes sería inaceptable), reintentar y luego enviar silenciosamente a una DLQ podría ocultar un problema que requiere atención inmediata en vez de diferida.

La dead-letter queue de este tema es la que evitará perder mensajes fallidos en el proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 3: Productor idempotente y transacciones (exactly-once)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar un productor idempotente y una transacción Kafka que evite publicar un evento duplicado si el productor reintenta tras un fallo de red, confirmando con un broker real que el duplicado nunca llega al topic.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Sin idempotencia, un timeout de red que en realidad SÍ se entregó en el broker hace que el productor reintente, publicando el mismo evento de negocio dos veces — un conductor podría recibir la misma notificación de "nueva entrega asignada" duplicada, o un pago podría registrarse dos veces si el evento dispara un cobro.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** productor idempotente, ack perdido en la red (no el mensaje), deduplicación por el broker.

```java
@Bean
ProducerFactory<String, Object> producerFactory() {
    Map<String, Object> config = new HashMap<>();
    config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
    config.put(ProducerConfig.ACKS_CONFIG, "all");
    return new DefaultKafkaProducerFactory<>(config);
}
```

Con `enable.idempotence=true`, el productor etiqueta cada lote de mensajes con un número de secuencia por partición; si el productor reintenta porque no recibió el `ack` (aunque el broker SÍ haya recibido y persistido el mensaje original, perdiéndose solo la confirmación en la red de vuelta), el broker detecta el número de secuencia repetido y descarta el duplicado en vez de escribirlo dos veces.

**Analogía:** es como un número de seguimiento de un paquete entregado por mensajería: si el mensajero reenvía el mismo paquete porque no recibió la confirmación de entrega (aunque el destinatario SÍ lo recibió), el número de seguimiento repetido permite detectar que es el mismo paquete, no uno nuevo.

**Diagrama:**

```mermaid
sequenceDiagram
  participant P as Productor
  participant B as Broker
  P->>B: mensaje (seq=5)
  B-->>P: ack (perdido en la red)
  P->>B: reintento mensaje (seq=5)
  B->>B: detecta seq=5 duplicado
  Note over B: descarta el duplicado, no escribe dos veces
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` y crea el publicador idempotente junto con un procesador que aplica su propia verificación de idempotencia, en `src/main/java/com/academia/mensajeria/`, confirmando con un broker real que un pago duplicado (el mismo `evento.id()` llegando dos veces al topic, el escenario real que un reintento de red o de aplicación produce) se aplica exactamente una vez:

```bash
mkdir -p academia-spring/src/main/java/com/academia/mensajeria
cd academia-spring
```

```java
// src/main/java/com/academia/mensajeria/PagoEvent.java
package com.academia.mensajeria;

import java.io.Serializable;

public record PagoEvent(String id, double monto) implements Serializable {}
```

```java
// src/main/java/com/academia/mensajeria/ProductorIdempotenteConfig.java
package com.academia.mensajeria;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ProductorIdempotenteConfig {

    @Bean
    ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    KafkaTemplate<String, Object> kafkaTemplatePagos(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }
}
```

```java
// src/main/java/com/academia/mensajeria/ProcesadorPagosIdempotente.java
package com.academia.mensajeria;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ProcesadorPagosIdempotente {
    // ids de pago ya aplicados (en producción: una columna UNIQUE o un Set persistido, no en memoria);
    // el test consulta este estado directamente para confirmar cuántas veces se aplicó el cobro REAL
    private final Set<String> idsYaAplicados = ConcurrentHashMap.newKeySet();
    private final AtomicInteger cobrosRealmenteAplicados = new AtomicInteger(0);

    @KafkaListener(topics = "pagos.registrados", groupId = "procesador-pagos")
    public void procesar(PagoEvent evento) {
        if (idsYaAplicados.add(evento.id())) { // add() devuelve true SOLO la primera vez que se ve este id
            cobrosRealmenteAplicados.incrementAndGet(); // el cobro real contra la pasarela de pago solo ocurre aquí
        }
        // si evento.id() ya estaba en el set, es un duplicado conocido: se descarta sin repetir el cobro
    }

    public int getCobrosRealmenteAplicados() { return cobrosRealmenteAplicados.get(); }
}
```

**Explicación línea por línea:** `ENABLE_IDEMPOTENCE_CONFIG` evita que un reintento INTERNO del cliente de Kafka (cuando el productor no recibe el `ack` a tiempo, aunque el broker SÍ haya escrito el mensaje original) duplique esa escritura a nivel de broker; pero no puede evitar que la APLICACIÓN llame a `send(...)` dos veces de forma independiente con el mismo evento (por ejemplo, un servicio llamador que no supo si su primer intento tuvo éxito y reenvía el mismo pago) — esas dos llamadas SÍ producen dos registros reales en el topic. `idsYaAplicados.add(evento.id())` es la defensa que efectivamente garantiza "exactamente una vez" desde la perspectiva de negocio: devuelve `true` solo la primera vez que ve ese id, así que `cobrosRealmenteAplicados` se incrementa una sola vez sin importar cuántas copias del mismo pago lleguen al consumidor.

Confirma con `@EmbeddedKafka` que, aunque el pago duplicado SÍ llega dos veces al topic, el procesador lo aplica una sola vez:

```java
// src/test/java/com/academia/mensajeria/ProductorIdempotenteTest.java
package com.academia.mensajeria;

import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.TestPropertySource;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = "pagos.registrados")
@TestPropertySource(properties = "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}")
class ProductorIdempotenteTest {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplatePagos;
    @Autowired
    private ProcesadorPagosIdempotente procesador;

    @Test
    void unPagoQueLlegaDuplicadoSeAplicaUnaSolaVez() {
        PagoEvent evento = new PagoEvent("pago-123", 50_000);

        kafkaTemplatePagos.send("pagos.registrados", evento.id(), evento); // envío original
        kafkaTemplatePagos.send("pagos.registrados", evento.id(), evento); // reintento real: el mismo evento, reenviado

        // los dos mensajes SÍ llegan al consumidor (dos llamadas independientes a send(), no un reintento interno de red);
        // la verificación de idempotencia del consumidor es la que garantiza que el cobro real ocurre una sola vez
        Awaitility.await().atMost(Duration.ofSeconds(5))
            .untilAsserted(() -> assertThat(procesador.getCobrosRealmenteAplicados()).isEqualTo(1));
    }
}
```

```bash
mvn test -Dtest=ProductorIdempotenteTest # Maven
./gradlew test --tests ProductorIdempotenteTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: ambos mensajes llegan realmente al topic `pagos.registrados` y ambos son entregados a `ProcesadorPagosIdempotente`, pero `idsYaAplicados.add(evento.id())` solo devuelve `true` en la primera entrega — `cobrosRealmenteAplicados` queda en exactamente `1`, confirmando "exactamente una vez" desde la perspectiva de negocio aunque el transporte haya entregado el evento dos veces.

**Fallo deliberado:** en `ProcesadorPagosIdempotente.procesar`, quita el `if (idsYaAplicados.add(evento.id()))` (incrementando `cobrosRealmenteAplicados` sin ninguna condición, para cada mensaje recibido sin importar su id) y ejecuta de nuevo `mvn test -Dtest=ProductorIdempotenteTest`. El test FALLA: `cobrosRealmenteAplicados` queda en `2` en vez de `1` — diagnostica confirmando que la idempotencia del PRODUCTOR (que sigue activa en `ProducerFactory`) nunca fue la responsable de evitar el cobro duplicado; sin la verificación explícita de idempotencia en el consumidor, el mismo pago se aplica dos veces. Restaura el `if` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Configura `acks=all` sin idempotencia y repite el experimento de reintento; confirma que el duplicado aparece igual (`acks=all` por sí solo no da idempotencia).
2. Combina idempotencia con una transacción que agrupe la publicación del evento Y una actualización del estado en base de datos (vía `KafkaTransactionManager` o un patrón outbox), confirmando que ambas operaciones tienen éxito o fallan juntas.
3. Mide con `@EmbeddedKafka` cuántos registros produce una publicación con y sin idempotencia tras forzar 3 reintentos simulados.
4. Escribe de memoria (sin mirar) la configuración mínima de un productor idempotente. Compara después contra el Paso 4.

**Pista:** la idempotencia del productor resuelve duplicados causados por reintentos DEL PRODUCTOR; no resuelve duplicados causados por reintentos DEL CONSUMIDOR (si el consumidor procesa un mensaje pero falla al confirmar el offset) — ese caso necesita diseño de consumidor idempotente, independiente del rebalanceo del Tema 4.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el valor que activa la deduplicación del productor:

```java
config.put(ProducerConfig.____, true);
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, el bean `ProducerFactory` con idempotencia activada y `acks=all`. Compara después contra el Paso 4.

#### Paso 7 · Cierre

Ya configuras un productor idempotente y confirmas, con un pago realmente duplicado en el topic, que la verificación de idempotencia del consumidor es la que garantiza que el cobro se aplique exactamente una vez. El siguiente tema aborda el rebalanceo de consumer groups, el costo operacional de escalar consumidores horizontalmente. Fuente oficial: [Exactly Once Semantics — Spring for Apache Kafka](https://docs.spring.io/spring-kafka/reference/kafka/exactly-once.html).

**Errores comunes:** asumir que `acks=all` por sí solo da idempotencia (da durabilidad, no deduplicación); asumir que la idempotencia del productor también deduplica errores del lado del consumidor.

**Cuándo no usarlo:** para eventos donde un duplicado ocasional es tolerable y barato de ignorar (ej. una métrica de telemetría no crítica), la ceremonia adicional de productor idempotente/transaccional puede no justificarse frente a su costo de throughput.

**Transferencia al proyecto integrador «Backend profesional de entregas»:** Publica una confirmación con identidad de evento estable y protege también el consumidor. Repite el evento de negocio y verifica un solo cobro, distinguiendo transacción Kafka de transacción de la base externa.

### Tema 4: Rebalanceo de consumer groups y partition assignment

#### Paso 1 · Objetivo y preparación

Al finalizar podrás reproducir un rebalanceo completo de un consumer group al reiniciar una instancia, y configurar static group membership para evitarlo en reinicios breves.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Cada vez que una instancia de un consumer group se une o abandona el grupo (incluyendo un simple restart de un pod en Kubernetes), Kafka reasigna TODAS las particiones entre TODAS las instancias restantes, deteniendo momentáneamente el consumo de todo el grupo — invisible en desarrollo con una sola instancia, pero costoso en producción con varias.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** consumer group, rebalanceo, partition assignment strategy, static membership.

```java
@Bean
ConsumerFactory<String, Object> consumerFactory() {
    Map<String, Object> config = new HashMap<>();
    config.put(ConsumerConfig.GROUP_INSTANCE_ID_CONFIG, "notificaciones-1");
    config.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG,
        CooperativeStickyAssignor.class.getName());
    return new DefaultKafkaConsumerFactory<>(config);
}
```

`group.instance.id` le da a esa instancia una identidad estable entre reinicios: si se reinicia dentro de una ventana de tiempo configurable (`session.timeout.ms`), el broker la trata como la MISMA instancia regresando, sin disparar un rebalanceo completo del grupo; `CooperativeStickyAssignor` además minimiza cuántas particiones efectivamente cambian de dueño cuando un rebalanceo sí ocurre, en vez de reasignar todas desde cero.

**Analogía:** un rebalanceo sin static membership es como reorganizar TODOS los escritorios de una oficina cada vez que una persona sale a almorzar y vuelve; con static membership, su escritorio la espera reservado durante una ausencia breve conocida, sin reorganizar nada si vuelve a tiempo.

**Diagrama:**

```mermaid
sequenceDiagram
  participant C1 as Consumer-1
  participant C2 as Consumer-2
  participant K as Broker (coordinador)
  C1->>K: restart (sin group.instance.id)
  K->>K: rebalanceo completo: reasigna TODAS las particiones
  Note over C1,C2: ambos detienen el consumo durante el rebalanceo
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` y crea un `ConsumerRebalanceListener` real que registra qué particiones tiene asignadas esta instancia en cada momento, en `src/main/java/com/academia/mensajeria/`, y un test que arranca dos consumidores reales en el mismo `groupId` para forzar un rebalanceo genuino y confirmar qué particiones se revocan y a quién se reasignan:

```bash
mkdir -p academia-spring/src/main/java/com/academia/mensajeria
cd academia-spring
```

```java
// src/main/java/com/academia/mensajeria/EstadoParticionRebalanceListener.java
package com.academia.mensajeria;

import org.apache.kafka.clients.consumer.ConsumerRebalanceListener;
import org.apache.kafka.common.TopicPartition;

import java.util.Collection;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class EstadoParticionRebalanceListener implements ConsumerRebalanceListener {
    // estado real de esta instancia: qué particiones tiene asignadas AHORA MISMO; se guarda/restaura en cada callback real del broker
    private final Set<TopicPartition> particionesAsignadasActualmente = ConcurrentHashMap.newKeySet();
    private final AtomicInteger revocacionesDetectadas = new AtomicInteger(0);

    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> particiones) {
        // el broker avisa: estas particiones YA NO son de esta instancia; el estado local debe reflejarlo de inmediato
        particionesAsignadasActualmente.removeAll(particiones);
        revocacionesDetectadas.incrementAndGet();
    }

    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> particiones) {
        // el broker avisa: estas particiones SÍ son de esta instancia ahora (asignación inicial o tras el rebalanceo)
        particionesAsignadasActualmente.addAll(particiones);
    }

    public Set<TopicPartition> getParticionesAsignadasActualmente() { return particionesAsignadasActualmente; }
    public int getRevocacionesDetectadas() { return revocacionesDetectadas.get(); }
}
```

**Explicación línea por línea:** `onPartitionsRevoked` es el callback real que el broker invoca en cada instancia justo antes de que un rebalanceo le quite particiones que tenía asignadas; aquí se usa para mantener `particionesAsignadasActualmente` siempre fiel a la realidad (sin este callback, una instancia podría seguir creyendo que posee una partición que el broker ya reasignó a otra instancia, un bug real de estado obsoleto); `onPartitionsAssigned` es el callback simétrico, invocado tanto en la asignación inicial como después de cada rebalanceo, con la lista de particiones que esta instancia posee a partir de ese momento.

Arranca dos `KafkaMessageListenerContainer` reales (uno a la vez) en el mismo `groupId`, contra un topic de 2 particiones, para forzar un rebalanceo genuino cuando el segundo se une:

```java
// src/test/java/com/academia/mensajeria/RebalanceoRealTest.java
package com.academia.mensajeria;

import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.context.TestPropertySource;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EmbeddedKafka(partitions = 2, topics = "tareas.creadas")
@TestPropertySource(properties = "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}")
class RebalanceoRealTest {

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    @Test
    void unSegundoConsumidorQueSeUneFuerzaUnRebalanceoRealYRedistribuyeLasParticiones() {
        var listenerA = new EstadoParticionRebalanceListener();
        var listenerB = new EstadoParticionRebalanceListener();

        var contenedorA = crearContenedor(listenerA);
        contenedorA.start();
        // sola en el grupo "rebalanceo-demo", esta instancia recibe las 2 particiones del topic
        Awaitility.await().atMost(Duration.ofSeconds(10))
            .untilAsserted(() -> assertThat(listenerA.getParticionesAsignadasActualmente()).hasSize(2));

        var contenedorB = crearContenedor(listenerB);
        contenedorB.start(); // forzar el rebalanceo real: el broker reparte las 2 particiones entre A y B

        try {
            Awaitility.await().atMost(Duration.ofSeconds(10))
                .untilAsserted(() -> assertThat(
                    listenerA.getParticionesAsignadasActualmente().size()
                        + listenerB.getParticionesAsignadasActualmente().size())
                    .isEqualTo(2));

            assertThat(listenerA.getRevocacionesDetectadas())
                .as("la primera instancia debe haber sido notificada de que perdió al menos una partición")
                .isGreaterThanOrEqualTo(1);
        } finally {
            contenedorA.stop();
            contenedorB.stop();
        }
    }

    private KafkaMessageListenerContainer<String, String> crearContenedor(EstadoParticionRebalanceListener listener) {
        Map<String, Object> config = KafkaTestUtils.consumerProps("rebalanceo-demo", "false", embeddedKafkaBroker);
        var factory = new DefaultKafkaConsumerFactory<String, String>(config);

        var propiedades = new ContainerProperties("tareas.creadas");
        propiedades.setConsumerRebalanceListener(listener);
        propiedades.setMessageListener((MessageListener<String, String>) record -> { });

        return new KafkaMessageListenerContainer<>(factory, propiedades);
    }
}
```

```bash
mvn test -Dtest=RebalanceoRealTest  # Maven
./gradlew test --tests RebalanceoRealTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: la primera instancia arranca sola y recibe las 2 particiones del topic (`onPartitionsAssigned` real); cuando la segunda se une al mismo `groupId`, el broker fuerza un rebalanceo genuino — la primera instancia recibe `onPartitionsRevoked` real para al menos una partición, y al final las 2 particiones quedan repartidas entre ambas (ninguna se pierde ni se duplica), confirmando que el estado de `particionesAsignadasActualmente` de cada instancia se mantiene fiel a lo que el broker realmente le asignó en cada momento.

**Fallo deliberado:** en `EstadoParticionRebalanceListener.onPartitionsRevoked`, quita la línea `particionesAsignadasActualmente.removeAll(particiones);` (deja solo el contador) y ejecuta de nuevo `mvn test -Dtest=RebalanceoRealTest`. El test FALLA en la aserción de la suma de particiones (ahora reporta `3` en vez de `2`, porque la primera instancia sigue "creyendo" que conserva una partición que el broker ya reasignó a la segunda) — diagnostica confirmando por qué ignorar `onPartitionsRevoked` deja a una instancia con estado local obsoleto tras un rebalanceo real: seguiría sirviendo, cacheando o contando datos de una partición que ya no le pertenece. Restaura la línea antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Repite el experimento con 3 instancias en vez de 2, y cuenta cuántas particiones cambian de dueño con y sin `CooperativeStickyAssignor`.
2. Configura `session.timeout.ms` deliberadamente corto (ej. 5 segundos) y confirma que un reinicio que tarda más que eso SÍ dispara rebalanceo incluso con static membership.
3. Documenta qué pasaría si dos instancias distintas usaran accidentalmente el mismo `group.instance.id`.
4. Escribe de memoria (sin mirar) la configuración de `group.instance.id` y `CooperativeStickyAssignor`. Compara después contra el Paso 4.

**Pista:** static membership protege contra reinicios BREVES y conocidos (deploys, restarts); no reemplaza un diseño que tolere genuinamente la pérdida permanente de una instancia (ese caso siempre necesita un rebalanceo real).

#### Paso 6 · Práctica independiente

**Completa el código:** rellena la configuración que da identidad estable a la instancia entre reinicios:

```java
config.put(ConsumerConfig.____, "notificaciones-1");
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, la configuración completa de un consumer con static membership y `CooperativeStickyAssignor`. Compara después contra el Paso 4.

#### Paso 7 · Cierre

Ya reproducís un rebalanceo real con dos consumidores del mismo grupo y confirmás, con un `ConsumerRebalanceListener` real, que las particiones se revocan y reasignan correctamente entre ambos. El siguiente y último tema de este módulo compara Kafka con RabbitMQ para elegir según el patrón de consumo real necesario. Fuente oficial: [Kafka Consumer Configs — Apache Kafka](https://kafka.apache.org/documentation/#consumerconfigs).

**Errores comunes:** asumir que un simple restart de un pod no tiene costo en un consumer group con muchas particiones; usar el mismo `group.instance.id` en dos instancias distintas por error de configuración (deben ser únicas).

**Cuándo no usarlo:** para un consumer group de una sola instancia (sin escalado horizontal), el rebalanceo no es un problema real a evitar; static membership agrega configuración sin beneficio en ese caso.

**Transferencia al proyecto integrador «Backend profesional de entregas»:** Ejecuta dos consumidores del grupo y retira uno durante el procesamiento. Comprueba reasignación y repetición segura de mensajes, conservando el orden por clave que necesita cada entrega.

### Tema 5: Kafka frente a RabbitMQ

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar el mismo flujo de consumo con Spring AMQP sobre RabbitMQ real, y explicar con evidencia en qué se diferencia su modelo de entrega del de Kafka.

**Conocimiento previo:** Temas 1 a 4 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Elegir la tecnología de mensajería equivocada para el patrón de consumo real necesario (retención y relectura de historial vs. distribución simple de trabajo) genera complejidad innecesaria o limitaciones inesperadas más adelante.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** log distribuido retenido frente a broker de colas tradicional.

`@RabbitListener(queues = "tareas.creadas") public void escuchar(TareaCreadaEvent evento) { ... }` es sintácticamente muy similar a `@KafkaListener`, pero el modelo subyacente es distinto: Kafka es un log distribuido que retiene mensajes durante un período configurable independientemente de si ya fueron consumidos, permitiendo que múltiples consumidores (o el mismo, releyendo desde un punto anterior) lean el mismo stream completo; RabbitMQ es un broker de colas tradicional, donde un mensaje típicamente se entrega y se elimina de la cola una vez consumido (patrón punto-a-punto).

**Analogía:** Kafka es un registro público permanente que cualquiera puede consultar en cualquier momento, incluso eventos ya "vistos" antes; RabbitMQ es un sistema de reparto de correspondencia donde cada carta se entrega a su destinatario y luego se considera completada, sin quedar disponible para que alguien más la vuelva a leer.

**Diagrama:**

```
┌── Kafka: log distribuido ────────────────────────┐
│  retiene mensajes; múltiples consumidores leen el      │
│  mismo stream completo, incluso ya "consumido" antes    │
└──────────────────────────────────────────────┘
┌── RabbitMQ: broker de colas tradicional ─────────┐
│  mensaje entregado y eliminado de la cola;              │
│  más simple para distribución punto-a-punto             │
└──────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-spring`, o créala con `mkdir -p academia-spring` si es tu primera vez), agrega la dependencia real `spring-boot-starter-amqp` y crea `src/main/java/com/academia/mensajeria/RabbitConfig.java` con el equivalente en RabbitMQ del publicador/consumidor del Tema 1:

```bash
mkdir -p academia-spring/src/main/java/com/academia/mensajeria
cd academia-spring
```

```java
// src/main/java/com/academia/mensajeria/RabbitConfig.java
package com.academia.mensajeria;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    @Bean
    Queue colaTareasCreadas() { return new Queue("tareas.creadas.rabbit", true); }
}
```

```java
// src/main/java/com/academia/mensajeria/RabbitListenerTareas.java
package com.academia.mensajeria;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class RabbitListenerTareas {
    private final List<String> mensajesRecibidos = new CopyOnWriteArrayList<>();

    @RabbitListener(queues = "tareas.creadas.rabbit")
    public void escuchar(String titulo) {
        mensajesRecibidos.add(titulo);
    }

    public List<String> getMensajesRecibidos() { return mensajesRecibidos; }
}
```

Confirma con `RabbitMQContainer` (el contenedor Docker real y oficial de Testcontainers para RabbitMQ, la misma técnica de fidelidad real que `PostgreSQLContainer` en el Módulo 6) que publicar y consumir vía RabbitMQ funciona, y a la vez ilustra la diferencia con Kafka: consume el mensaje UNA vez y confirma que releerlo después no lo entrega de nuevo:

```java
// src/test/java/com/academia/mensajeria/RabbitVsKafkaTest.java
package com.academia.mensajeria;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest
@Testcontainers
class RabbitVsKafkaTest {

    @Container
    static RabbitMQContainer rabbit = new RabbitMQContainer("rabbitmq:3.13-management");

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", rabbit::getHost);
        registry.add("spring.rabbitmq.port", rabbit::getAmqpPort);
    }

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private RabbitListenerTareas listener;

    @Test
    void unMensajeDeRabbitSeEntregaUnaSolaVezYLuegoDesaparece() {
        rabbitTemplate.convertAndSend("tareas.creadas.rabbit", "Comprar leche");

        await().atMost(Duration.ofSeconds(5))
            .untilAsserted(() -> assertThat(listener.getMensajesRecibidos()).contains("Comprar leche"));

        // a diferencia de Kafka (Tema 1), RabbitMQ elimina el mensaje de la cola tras entregarlo:
        // no hay forma de "releerlo" de nuevo como con un consumer group nuevo sobre el mismo topic
        Object mensajePendiente = rabbitTemplate.receiveAndConvert("tareas.creadas.rabbit");
        assertThat(mensajePendiente).isNull();
    }
}
```

```bash
# requiere Docker corriendo localmente; Testcontainers levanta el broker RabbitMQ real
mvn test -Dtest=RabbitVsKafkaTest   # Maven
./gradlew test --tests RabbitVsKafkaTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: el mensaje se entrega al listener real vía RabbitMQ, y al intentar leer la cola de nuevo directamente (`receiveAndConvert`), no queda ningún mensaje pendiente — confirmando en código, no solo en teoría, la diferencia central con Kafka (Tema 1): RabbitMQ elimina el mensaje de la cola tras la entrega, mientras Kafka lo retiene y permitiría que un nuevo `groupId` lo releyera desde el principio del topic.

**Fallo deliberado:** intenta releer el mismo mensaje con un `RabbitListener` adicional usando un `groupId` conceptualmente equivalente al de Kafka (RabbitMQ no tiene el concepto de `groupId`; si agregas un SEGUNDO `@RabbitListener(queues = "tareas.creadas.rabbit")` en otra clase, ambos listeners COMPITEN por los mensajes de la misma cola, cada mensaje se entrega a SOLO UNO de los dos, no a ambos). Verifica esto agregando un segundo listener y confirmando que la suma de mensajes recibidos por ambos, no cada uno por separado, coincide con el total publicado — diagnostica confirmando que RabbitMQ implementa competencia de consumidores (distribución de trabajo) sobre una cola, fundamentalmente distinto del fan-out real que Kafka logra con múltiples `groupId` independientes, cada uno recibiendo TODOS los mensajes (Tema 1, Paso 5, punto 1).

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo test que confirme la competencia de consumidores: dos `@RabbitListener` sobre la misma cola, publica 10 mensajes, y confirma que la SUMA de lo recibido por ambos es 10 (no 20, como sería con dos `@KafkaListener` con `groupId` distintos sobre el mismo topic).
2. Configura la cola de RabbitMQ como `durable = false` y documenta, basándote en la documentación oficial, qué pasaría con los mensajes pendientes si el broker se reiniciara.
3. Compara el tiempo de arranque del contenedor `RabbitMQContainer` (Tema 5) frente a `@EmbeddedKafka` (Temas 1-2) ejecutando ambas suites y observando los tiempos reportados por Maven.
4. Escribe de memoria (sin mirar) una tabla de dos columnas comparando Kafka y RabbitMQ en retención, patrón de consumo y fan-out real vs. competencia de consumidores. Compara después contra el patrón del Paso 4.

**Pista:** la pregunta que determina la elección correcta no es "¿cuál es más rápido o más popular?", sino "¿necesito que MÚLTIPLES consumidores independientes reciban CADA UNO su propia copia completa del mismo mensaje (Kafka), o necesito distribuir CADA mensaje entre UN SOLO trabajador de un pool (RabbitMQ)?".

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para registrar el consumidor sobre la cola de RabbitMQ:

```java
@____(queues = "tareas.creadas.rabbit")
public void escuchar(String titulo) { }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test que confirme que RabbitMQ elimina un mensaje de la cola tras entregarlo, a diferencia de la retención de Kafka. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya implementas el mismo patrón de consumo desacoplado sobre RabbitMQ real, confirmando con evidencia de código la diferencia central de modelo de entrega frente a Kafka. Esto cierra el módulo de mensajería; el siguiente módulo aborda cómo estructurar el código de dominio con principios de arquitectura hexagonal. Fuente oficial: [Spring AMQP Reference](https://docs.spring.io/spring-amqp/reference/).

**Errores comunes:** confundir el modelo de retención de Kafka con el de RabbitMQ, asumiendo que ambos permiten releer el historial completo; asumir que agregar un segundo `@RabbitListener` sobre la misma cola duplicará la entrega, cuando en realidad divide el trabajo entre ambos.

**Cuándo no usarlo:** para un flujo que necesita garantías de ordenamiento estricto y reprocesamiento completo del historial de eventos de negocio (auditoría, event sourcing), RabbitMQ por sí solo no ofrece esa retención; Kafka es la elección más apropiada para ese patrón específico.

---

La comparación Kafka frente a RabbitMQ de este tema es la que justificará la elección de mensajería del proyecto integrador de este track (microservicio productivo, Módulo 12).

## Laboratorio práctico

**Objetivo del laboratorio:** construir un servicio que publica y consume eventos vía Kafka con manejo robusto de errores, productor idempotente y consumer groups resilientes a reinicios.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Levantar un broker Kafka embebido en los tests | Ver Tema 1 | `@EmbeddedKafka`, sin Docker |
| 2 | Implementar un `@KafkaListener` | Ver Tema 1 | Consume y procesa el evento real |
| 3 | Confirmar la entrega con `Awaitility` | Ver Tema 1 | El consumo es asíncrono |
| 4 | Configurar reintentos y dead-letter queue | Ver Tema 2 | Verifica el mensaje fallido en `.DLT` real |
| 5 | Configurar un productor idempotente | Ver Tema 3 | Evita duplicados por reintento de red |
| 6 | Configurar static group membership | Ver Tema 4 | Evita rebalanceo completo en reinicios breves |
| 7 | Repetir con RabbitMQ y comparar | Ver Tema 5 | `RabbitMQContainer`, compara los modelos de entrega |

**Verificación:** el laboratorio se considera exitoso si un mensaje que falla repetidamente termina correctamente en la dead-letter queue real tras agotar los reintentos, sin bloquear el procesamiento de mensajes posteriores exitosos, si un reintento de red simulado no produce un evento duplicado en el topic, si un reinicio breve de una instancia no dispara un rebalanceo completo del grupo, y si la diferencia de modelo de entrega entre Kafka y RabbitMQ está confirmada con evidencia de test, no solo descrita.

**Errores comunes y soluciones**

- **No configurar una dead-letter queue.** Sin ella, un mensaje que falla repetidamente puede bloquear o perderse silenciosamente.
- **Confundir el modelo de retención de Kafka con el de RabbitMQ.** Verifica cuál patrón de consumo real necesita tu caso de uso antes de elegir.
- **No serializar explícitamente el formato del mensaje.** Configura un serializer explícito para evitar ambigüedad de formato entre productor y consumidor.
- **No activar idempotencia en el productor.** Un reintento de red sin `enable.idempotence=true` puede duplicar un evento de negocio.
- **No configurar `group.instance.id`.** Sin identidad estable, cada reinicio de instancia dispara un rebalanceo completo que detiene momentáneamente todo el consumer group.

---
