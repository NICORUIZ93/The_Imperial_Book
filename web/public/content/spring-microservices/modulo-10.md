# Módulo 10 · Event-Driven Architecture en Tienda Aurora

Tienda Aurora procesa miles de pedidos por hora. Cuando un pedido se confirma, `orders-service` debe notificar a email, analytics, inventario y facturación. Si cada uno es una llamada síncrona, un servicio caído tumba el checkout. La solución es publicar un evento `OrderCreated` y dejar que cada consumidor procese a su ritmo. EDA desacopla productores y consumidores mediante eventos. El beneficio es escalabilidad y autonomía; el costo es consistencia eventual, duplicados, orden parcial y evolución de esquemas.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de particionado, DLQ, compatibilidad de esquema e idempotencia ejecutados con Java puro. Kafka/RabbitMQ/Schema Registry/Spring Cloud Stream requieren infraestructura; se incluyen notas de verificación honestas.

### Tema 1: Kafka, particiones y consumer groups · Avanzado · 150 min

## Kafka: particiones y consumer groups

`orders-service` publica `OrderCreated`. Múltiples instancias de `billing-service` deben procesar eventos en paralelo, pero los eventos del mismo pedido deben conservar orden. El equipo asume que los eventos se procesan en orden global. En producción, `OrderCancelled` se procesa antes de `OrderCreated` y billing falla con "orden no encontrada".

Apache Kafka es un log distribuido, particionado y replicado. Un topic contiene particiones; un producer escribe registros; un consumer group coordina consumidores para repartir particiones. Cada partición es una secuencia ordenada; el offset identifica la posición. El orden solo existe dentro de una partición. Para preservar orden por agregado, se usa una key que enruta todos sus eventos a la misma partición.

```java
public class KafkaPartitionSmoke {
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
javac KafkaPartitionSmoke.java
java KafkaPartitionSmoke
```

Salida esperada:

```text
in-range=true
deterministic=true
```

El error más común es asumir orden global. El síntoma es `OrderCancelled` procesado antes de `OrderCreated`. La causa es key aleatoria o ausente. La corrección es usar key por agregado y consumidor idempotente.

En Spring Cloud Stream, la configuración de particionado:

```kotlin
// orders-service build.gradle.kts
implementation("org.springframework.cloud:spring-cloud-starter-stream-kafka")
```

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderCreated-out-0:
          destination: orders.created
          producer:
            partitionKeyExpression: payload.orderId
            partitionCount: 3
```

### Tema 2: RabbitMQ, acks y DLQ · Intermedio · 120 min

## RabbitMQ: acks y DLQ para mensajes venenosos

Un worker de Tienda Aurora procesa pagos. Un mensaje con payload inválido falla, se reintentan infinitamente y bloquea la cola. El mismo `messageId` aparece miles de veces en logs. La cola crece sin que nadie pueda procesar los mensajes válidos detrás del veneno.

RabbitMQ es un message broker que enruta mensajes desde exchanges hacia queues mediante bindings. Un ack confirma procesamiento exitoso; nack/reject indica fallo. Una DLQ (dead-letter queue) recibe mensajes rechazados, expirados o no enrutables según configuración. Auto-ack en tareas críticas es un error: si el consumidor falla antes de procesar, el mensaje se pierde.

```java
import java.util.*;

public class RabbitDlqSmoke {
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
javac RabbitDlqSmoke.java
java RabbitDlqSmoke
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

public class SchemaCompatSmoke {
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
javac SchemaCompatSmoke.java
java SchemaCompatSmoke
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

public class ConsumerIdempotencySmoke {
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
javac ConsumerIdempotencySmoke.java
java ConsumerIdempotencySmoke
```

Salida esperada:

```text
processed
duplicate-ignored
effects=1
```

El error más común es consumidor no idempotente ante redelivery. El síntoma es cobro o reserva duplicada. La causa es asumir exactly-once. La corrección es dedup por `eventId` + constraint único + idempotency keys en efectos externos.

## Cierre

EDA requiere disciplina de contratos: claves de partición, DLQ, esquemas compatibles e idempotencia. Sin eso, el desacoplamiento se vuelve caos operativo. Para Tienda Aurora, esto significa que cuando un pedido se confirma, los eventos fluyen a email, analytics, inventario y billing sin acoplamiento temporal, y cada consumidor tolera redeliveries sin duplicar efectos.

## Checklist

- Orden por clave de agregado cuando importa.
- DLQ y retries acotados.
- Esquemas compatibles versionados.
- Consumidores idempotentes con dedup persistente.
- Verificación honesta cuando falta broker/registry.
