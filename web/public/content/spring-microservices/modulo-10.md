# Módulo 10 · Event-Driven Architecture en Tienda Aurora

Tienda Aurora procesa miles de pedidos por hora. Cuando un pedido se confirma, `orders-service` debe notificar a email, analytics, inventario y facturación. Si cada uno es una llamada síncrona, un servicio caído tumba el checkout. La solución es publicar un evento `OrderCreated` y dejar que cada consumidor procese a su ritmo. EDA desacopla productores y consumidores mediante eventos. El beneficio es escalabilidad y autonomía; el costo es consistencia eventual, duplicados, orden parcial y evolución de esquemas.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Smokes de particionado, DLQ, compatibilidad de esquema e idempotencia ejecutados con Java puro. Kafka/RabbitMQ/Schema Registry/Spring Cloud Stream requieren infraestructura; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-messaging

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
docker --version  # Docker 24+ (para Kafka/RabbitMQ)
```

### Estructura del proyecto

```text
tienda-aurora-messaging/
├── build.gradle.kts
├── settings.gradle.kts
├── docker-compose.yml
├── shared/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/shared/event/
│       └── OrderCreated.java
├── orders-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/orders/
│       ├── OrdersApplication.java
│       └── event/OrderEventPublisher.java
└── billing-service/
    ├── build.gradle.kts
    └── src/main/java/com/aurora/billing/
        ├── BillingApplication.java
        └── event/OrderCreatedConsumer.java
```

### build.gradle.kts (raíz)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
}

subprojects {
    apply(plugin = "java")
    java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
    repositories { mavenCentral() }
    dependencies {
        implementation("org.springframework.boot:spring-boot-starter-web")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-messaging"
include("shared", "orders-service", "billing-service")
```

### docker-compose.yml (Kafka + Schema Registry)

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on: [zookeeper]
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  schema-registry:
    image: confluentinc/cp-schema-registry:7.6.0
    depends_on: [kafka]
    ports:
      - "8081:8081"
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: kafka:9092
```

### Tema 1: Kafka, particiones y consumer groups · Avanzado · 150 min

## Kafka: particiones y consumer groups

`orders-service` publica `OrderCreated`. Múltiples instancias de `billing-service` deben procesar eventos en paralelo, pero los eventos del mismo pedido deben conservar orden. El equipo asume que los eventos se procesan en orden global. En producción, `OrderCancelled` se procesa antes de `OrderCreated` y billing falla con "orden no encontrada".

Apache Kafka es un log distribuido, particionado y replicado. Un topic contiene particiones; un producer escribe registros; un consumer group coordina consumidores para repartir particiones. Cada partición es una secuencia ordenada. El orden solo existe dentro de una partición. Para preservar orden por agregado, se usa una key que enruta todos sus eventos a la misma partición.

```java
public class KafkaPartitionExample {
    static int partition(String key, int partitions) {
        return Math.floorMod(key.hashCode(), partitions);
    }

    public static void main(String[] args) {
        int p1 = partition("order-1", 3);
        int p2 = partition("order-1", 3);
        System.out.println("in-range=" + (p1 >= 0 && p1 < 3));
        System.out.println("deterministic=" + (p1 == p2));
    }
}
```

```bash
javac KafkaPartitionExample.java
java KafkaPartitionExample
```

Salida esperada:

```text
in-range=true
deterministic=true
```

El error más común es asumir orden global. El síntoma es `OrderCancelled` procesado antes de `OrderCreated`. La causa es key aleatoria o ausente. La corrección es usar key por agregado y consumidor idempotente.

### Tema 2: RabbitMQ, acks y DLQ · Intermedio · 120 min

## RabbitMQ: acks y DLQ para mensajes venenosos

Un worker de Tienda Aurora procesa pagos. Un mensaje con payload inválido falla, se reintentan infinitamente y bloquea la cola. El mismo `messageId` aparece miles de veces en logs. La cola crece sin que nadie pueda procesar los mensajes válidos detrás del veneno.

RabbitMQ es un message broker que enruta mensajes desde exchanges hacia queues mediante bindings. Un ack confirma procesamiento exitoso; nack/reject indica fallo. Una DLQ (dead-letter queue) recibe mensajes rechazados, expirados o no enrutables según configuración. Auto-ack en tareas críticas es un error: si el consumidor falla antes de procesar, el mensaje se pierde.

```java
import java.util.*;

public class RabbitDlqExample {
    static List<String> q = new ArrayList<>(List.of("m1", "m2"));
    static List<String> dlq = new ArrayList<>();
    static int maxRetries = 3;

    static void process(String msg, boolean willFail) {
        if (willFail) {
            if (maxRetries <= 0) dlq.add(msg);
            else maxRetries--;
        }
    }

    public static void main(String[] args) {
        process("m1", true); process("m1", true); process("m1", true); process("m1", true);
        System.out.println("queue=" + q.size());
        System.out.println("dlq=" + dlq.size());
        System.out.println("dlq-contains-m1=" + dlq.contains("m1"));
    }
}
```

```bash
javac RabbitDlqExample.java
java RabbitDlqExample
```

Salida esperada:

```text
queue=2
dlq=1
dlq-contains-m1=true
```

El error más común es reintento infinito sin DLQ. El síntoma es un mensaje inválido que bloquea el procesamiento. La causa es no tener límite ni DLQ. La corrección es ack manual, retries acotados, DLQ y alerta.

### Tema 3: Schema Registry y evolución · Avanzado · 120 min

## Schema Registry: evolución de contratos sin romper consumidores

El equipo agrega `status` al evento `OrderCreated` y despliega el productor. Consumidores viejos que no conocen el campo fallan al deserializar. No hay registro central de esquemas ni política de compatibilidad. El despliegue independiente se vuelve un incidente.

Un Schema Registry almacena versiones de esquemas (Avro, Protobuf, JSON Schema) y valida compatibilidad entre versiones. Backward: consumidor nuevo lee datos escritos con esquema viejo. Forward: consumidor viejo lee datos escritos con esquema nuevo. Full: ambos sentidos.

```java
import java.util.*;

public class SchemaCompatExample {
    static boolean backwardCompatible(Set<String> oldFields, Set<String> newFields) {
        return newFields.containsAll(oldFields);
    }

    static boolean forwardCompatible(Set<String> oldFields, Set<String> newFields) {
        return oldFields.containsAll(newFields);
    }

    public static void main(String[] args) {
        Set<String> v1 = Set.of("id");
        Set<String> v2 = Set.of("id", "status");
        System.out.println("backward-v1-to-v2=" + backwardCompatible(v1, v2));
        System.out.println("backward-v2-to-v1=" + backwardCompatible(v2, v1));
        System.out.println("forward-v1-to-v2=" + forwardCompatible(v1, v2));
    }
}
```

```bash
javac SchemaCompatExample.java
java SchemaCompatExample
```

Salida esperada:

```text
backward-v1-to-v2=true
backward-v2-to-v1=false
forward-v1-to-v2=false
```

Agregar `status` con default es backward-compatible. Quitar un campo requerido no lo es. El error más común es cambio incompatible de esquema: deserialización falla tras despliegue de productor.

### Tema 4: Idempotencia en consumidores · Avanzado · 120 min

## Idempotencia en consumidores: la defensa ante duplicados

`OrderCreated` se entrega dos veces por un reintento del broker. El consumidor crea dos cobros. El cliente reclama. El equipo asume que "el broker entrega una vez". No fue así: at-least-once es el modelo base.

La idempotencia es como un sello de "ya procesado" en el buzón. Si la misma carta llega dos veces, la segunda se detecta y se ignora. El sello debe persistir (no en memoria) para sobrevivir reinicios.

```java
import java.util.*;

public class ConsumerIdempotencyExample {
    record InboxEvent(String eventId, String orderId) {}

    static class IdempotentConsumer {
        private final Set<String> inbox = new HashSet<>();
        private final List<String> effects = new ArrayList<>();

        String handle(InboxEvent e) {
            if (!inbox.add(e.eventId())) return "duplicate-ignored";
            effects.add("charge:" + e.orderId());
            return "processed";
        }

        int effectCount() { return effects.size(); }
    }

    public static void main(String[] args) {
        IdempotentConsumer c = new IdempotentConsumer();
        InboxEvent e = new InboxEvent("evt-1", "ord-1");
        System.out.println(c.handle(e));
        System.out.println(c.handle(e));
        System.out.println("effects=" + c.effectCount());
    }
}
```

```bash
javac ConsumerIdempotencyExample.java
java ConsumerIdempotencyExample
```

Salida esperada:

```text
processed
duplicate-ignored
effects=1
```

El error más común es consumidor no idempotente ante redelivery. El síntoma es cobro o reserva duplicada. La causa es asumir exactly-once. La corrección es dedup por `eventId` + constraint único + idempotency keys en efectos externos.

## Cierre

EDA requiere disciplina de contratos: claves de partición, DLQ, esquemas compatibles e idempotencia. Sin eso, el desacoplamiento se vuelve caos operativo. Para Tienda Aurora, esto significa que cuando un pedido se confirma, los eventos fluyen a email, analytics, inventario y billing sin acoplamiento temporal, y cada consumidor tolera redeliveries sin duplicar efectos. Gradle coordina el build multi-módulo con dependencias por servicio.

## Checklist

- Orden por clave de agregado cuando importa.
- DLQ y retries acotados.
- Esquemas compatibles versionados.
- Consumidores idempotentes con dedup persistente.
- Verificación honesta cuando falta broker/registry.
