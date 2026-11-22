# Módulo 10 · Event-Driven Architecture y mensajería en Spring

EDA desacopla productores y consumidores mediante eventos. El beneficio es escalabilidad y autonomía; el costo es consistencia eventual, duplicados, orden parcial y evolución de esquemas. Este módulo cubre Kafka/RabbitMQ, Schema Registry, DLQ/DLT e idempotencia con criterio operativo.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de particionado, DLQ, compatibilidad de esquema e idempotencia ejecutados con Java puro. Kafka/RabbitMQ/Schema Registry/Spring Cloud Stream requieren infraestructura; se incluyen notas de verificación honestas.

## Aprende construyendo

### Tema 1: Kafka, particiones y consumer groups · Avanzado · 150 min

Caso guía: `orders-service` publica `OrderCreated`; múltiples instancias de `billing-service` deben procesar eventos en paralelo, pero los eventos del mismo pedido deben conservar orden.

#### Definición formal

Apache Kafka es un log distribuido, particionado y replicado. Un **topic** contiene particiones; un **producer** escribe registros; un **consumer group** coordina consumidores para repartir particiones. Cada partición es una secuencia ordenada; el offset identifica la posición.

#### Contrato / internals

- **Orden:** garantizado solo dentro de una partición.
- **Key:** determina partición por hash; misma key -> misma partición mientras el número de particiones no cambie de forma incompatible.
- **Consumer group:** una partición es consumida por a lo más un consumidor activo dentro del grupo.
- **Entrega:** at-least-once es el modelo base habitual; duplicados son posibles.
- **Replay:** el consumidor puede volver a leer por offset si la retención lo permite.

#### Cuándo usarlo / cuándo no

**Úsalo** para alto throughput, replay, event streaming y desacoplamiento temporal. **No lo uses** para request/response simple, ni cuando una cola de trabajo simple basta y no quieres operar Kafka.

#### Ejemplo mínimo ejecutable

Crea el archivo `Kafka.java`:

```java
public class Kafka {
  static int partition(String key, int partitions) {
    return Math.floorMod(key.hashCode(), partitions);
  }
  public static void main(String[] args) {
    System.out.println(partition("o1", 3) >= 0);
    System.out.println(partition("o1", 3) == partition("o1", 3));
  }
}
```

```bash
javac Kafka.java
java Kafka
```

Salida esperada:

```text
true
true
```

#### Caso real

Todos los eventos de `orderId=o1` se publican con key `o1`. `billing-service` escala a 3 instancias; Kafka reparte particiones, pero conserva el orden de `o1` dentro de su partición.

#### Error común

**Síntoma.** `OrderCancelled` se procesa antes de `OrderCreated`. **Causa.** key aleatoria o ausencia de key; se asumió orden global. **Corrección.** usar key por agregado y consumidor idempotente. **Señal observable.** errores intermitentes de estado no encontrado.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `true`.

**Nota de verificación:** no se ejecutó Kafka broker real. Verificación propuesta con Docker/Testcontainers: crear topic con 3 particiones, producir con misma key y confirmar misma partición/orden.

### Tema 2: RabbitMQ, acks y DLQ · Intermedio · 120 min

Caso guía: un worker procesa pagos. Si falla por payload inválido, el mensaje no debe reintentarse infinitamente; debe ir a una DLQ para inspección.

#### Definición formal

RabbitMQ es un message broker que enruta mensajes desde exchanges hacia queues mediante bindings. Un **ack** confirma procesamiento exitoso; **nack/reject** indica fallo. Una **DLQ** (dead-letter queue) recibe mensajes rechazados, expirados o no enrutables según configuración.

#### Contrato / internals

- **Exchange:** recibe mensajes y los enruta (direct, topic, fanout, headers).
- **Queue:** almacena mensajes hasta consumo/expiración.
- **Ack manual:** el consumidor confirma tras éxito; evita pérdida por crash antes de procesar.
- **DLQ:** requiere política/límite de reintentos; evita poison messages.
- **Límite:** DLQ no corrige el bug; solo aísla el mensaje fallido.

#### Cuándo usarlo / cuándo no

**Úsalo** para work queues, routing flexible, tareas asíncronas con semántica de cola. **No** uses auto-ack en tareas críticas; no uses reintentos infinitos sin DLQ.

#### Ejemplo mínimo ejecutable

Crea el archivo `Dlq.java`:

```java
import java.util.*;
public class Dlq {
  static List<String> q = new ArrayList<>(List.of("m1"));
  static List<String> dlq = new ArrayList<>();
  static void consume() {
    String m = q.remove(0);
    dlq.add(m); // falla permanente simulada
  }
  public static void main(String[] args) {
    consume();
    System.out.println(q.size());
    System.out.println(dlq.size());
  }
}
```

```bash
javac Dlq.java
java Dlq
```

Salida esperada:

```text
0
1
```

#### Caso real

Spring AMQP configura `RetryInterceptor` con max attempts y `RepublishMessageRecoverer` hacia `orders.dlq`. El equipo monitorea DLQ y reprocesa tras corregir la causa.

#### Error común

**Síntoma.** un mensaje inválido bloquea el procesamiento. **Causa.** reintento infinito sin DLQ ni límite. **Corrección.** ack manual, retries acotados, DLQ y alerta. **Señal observable.** el mismo `messageId` aparece repetido en logs y el lag/queue depth crece.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `0`, `1`.

**Nota de verificación:** no se ejecutó RabbitMQ real. Verificación propuesta: Testcontainers RabbitMQ, publicar mensaje inválido, confirmar llegada a DLQ y ausencia de loop infinito.

### Tema 3: Schema Registry y evolución · Avanzado · 120 min

Caso guía: agregas `status` al evento `OrderCreated`. Consumidores viejos siguen desplegados durante horas.

#### Definición formal

Un Schema Registry almacena versiones de esquemas (Avro, Protobuf, JSON Schema) y valida compatibilidad entre versiones. La evolución de esquema define qué cambios son seguros según el modo de compatibilidad.

#### Contrato / internals

- **Backward:** consumidor nuevo lee datos escritos con esquema viejo.
- **Forward:** consumidor viejo lee datos escritos con esquema nuevo.
- **Full:** ambos sentidos.
- **Cambio típico seguro:** agregar campo opcional con default.
- **Cambio riesgoso:** eliminar campo requerido, cambiar tipo incompatible, renombrar sin alias/plan.

#### Cuándo usarlo / cuándo no

**Úsalo** con múltiples productores/consumidores y despliegues independientes. **No** hagas cambios incompatibles sin versionado, migración y ventana de compatibilidad.

#### Ejemplo mínimo ejecutable

Crea el archivo `Schema.java`:

```java
import java.util.*;
public class Schema {
  static boolean backwardCompatible(Set<String> oldFields, Set<String> newFields) {
    return newFields.containsAll(oldFields);
  }
  public static void main(String[] args) {
    System.out.println(backwardCompatible(Set.of("id"), Set.of("id", "status")));
    System.out.println(backwardCompatible(Set.of("id", "status"), Set.of("id")));
  }
}
```

```bash
javac Schema.java
java Schema
```

Salida esperada:

```text
true
false
```

#### Caso real

Se registra `OrderCreated` v2 con `status` default `NEW`. Productores nuevos publican v2; consumidores viejos siguen leyendo v1/v2 según compatibilidad. CI falla si el esquema rompe la política.

#### Error común

**Síntoma.** deserialización falla tras despliegue de productor. **Causa.** cambio incompatible de esquema. **Corrección.** usar Schema Registry, política de compatibilidad y tests de contrato. **Señal observable.** picos de errores de deserialización/consumer lag tras release.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó Schema Registry real. Verificación propuesta: levantar Kafka+Schema Registry, registrar esquema v1/v2 y validar compatibilidad backward.

### Tema 4: Idempotencia en consumidores · Avanzado · 120 min

Caso guía: `OrderCreated` se entrega dos veces por reintento. El consumidor no debe crear dos cobros.

#### Definición formal

Idempotencia en consumidores significa que procesar el mismo evento una vez o varias veces produce el mismo efecto observable. Es la defensa estándar ante at-least-once delivery.

#### Contrato / internals

- **Clave de dedup:** `eventId`, `messageId`, o clave natural del negocio.
- **Almacenamiento:** tabla inbox/dedup con constraint único, o condición transaccional.
- **Ventana:** la dedup puede ser permanente o por TTL, según el riesgo de negocio.
- **Efectos externos:** si se llama a un API externa, usar idempotency key.
- **Límite:** dedup en memoria no sobrevive reinicios.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre en consumidores de eventos/comandos críticos. **No** confíes en exactly-once del broker como única garantía end-to-end.

#### Ejemplo mínimo ejecutable

Crea el archivo `Idem.java`:

```java
import java.util.*;
public class Idem {
  static Set<String> seen = new HashSet<>();
  static String handle(String id) {
    return seen.add(id) ? "processed" : "duplicate";
  }
  public static void main(String[] args) {
    System.out.println(handle("e1"));
    System.out.println(handle("e1"));
  }
}
```

```bash
javac Idem.java
java Idem
```

Salida esperada:

```text
processed
duplicate
```

#### Caso real

El consumidor inserta `eventId` en `inbox_events` con unique constraint antes de aplicar el efecto. Si ya existe, confirma el mensaje y no vuelve a cobrar.

#### Error común

**Síntoma.** cobro o reserva duplicada. **Causa.** consumer no idempotente ante redelivery. **Corrección.** dedup por `eventId` + constraint único + idempotency keys en efectos externos. **Señal observable.** mismo `eventId` con dos efectos de negocio.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `processed`, `duplicate`.

**Nota de verificación:** no se ejecutó consumer Kafka/RabbitMQ real. Verificación propuesta: publicar el mismo evento dos veces y verificar un solo efecto en DB.

## Cierre

EDA requiere disciplina de contratos: claves de partición, DLQ, esquemas compatibles e idempotencia. Sin eso, el desacoplamiento se vuelve caos operativo.

## Checklist

- Orden por clave cuando importa.
- DLQ y retries acotados.
- Esquemas compatibles versionados.
- Consumidores idempotentes.
- Verificación honesta cuando falta broker/registry.
