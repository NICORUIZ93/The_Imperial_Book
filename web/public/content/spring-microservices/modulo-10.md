# Módulo 10 · Event-Driven Architecture y mensajería en Spring

EDA desacopla productores y consumidores mediante eventos. El beneficio es escalabilidad y autonomía; el costo es consistencia eventual, duplicados, orden parcial y evolución de esquemas. Este módulo cubre Kafka/RabbitMQ, Spring Cloud Stream, Schema Registry, DLQ/DLT e idempotencia.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan smokes de idempotencia, DLQ y evolución de esquema con Java puro. Kafka/RabbitMQ/Schema Registry/Spring Cloud Stream requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Kafka, particiones y consumer groups · Avanzado · 150 min

Caso guía: escalar consumidores de `OrderCreated`.

#### Kafka

**Definición formal.** Kafka es un log distribuido particionado. Los producers escriben en topics; consumer groups reparten particiones entre consumidores.

**Cuándo usarlo / cuándo no.** Úsalo para alto throughput, replay y streaming. No para colas simples si no necesitas sus garantías/costo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm10-kafka
cd sm10-kafka
```

Crea el archivo `Kafka.java`:

```java
public class Kafka {
  static int partition(String key, int partitions){ return Math.floorMod(key.hashCode(), partitions); }
  public static void main(String[] args){ System.out.println(partition("o1",3)>=0); System.out.println(partition("o1",3)==partition("o1",3)); }
}
```

```bash
javac Kafka.java
java Kafka
```

**Error común.** Asumir orden global.

**Síntoma.** eventos relacionados procesados fuera de orden. **Causa.** orden solo por partición. **Corrección.** key por agregado. **Señal observable.** estado inconsistente intermitente.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `true`.

### Tema 2: RabbitMQ, acks y DLQ · Intermedio · 120 min

Caso guía: reintentar mensajes fallidos sin loop infinito.

#### RabbitMQ

**Definición formal.** RabbitMQ enruta mensajes mediante exchanges y queues. Acks confirman procesamiento; DLQ captura mensajes fallidos.

**Cuándo usarlo / cuándo no.** Úsalo para work queues/routing flexible. No uses auto-ack en tareas críticas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm10-dlq
cd sm10-dlq
```

Crea el archivo `Dlq.java`:

```java
import java.util.*;
public class Dlq {
  static List<String> q = new ArrayList<>(List.of("m1")), dlq = new ArrayList<>();
  static void consume(){ String m=q.remove(0); dlq.add(m); }
  public static void main(String[] args){ consume(); System.out.println(q.size()); System.out.println(dlq.size()); }
}
```

```bash
javac Dlq.java
java Dlq
```

**Error común.** Reintentar infinitamente.

**Síntoma.** poison message bloquea progreso. **Causa.** no hay DLQ/límite. **Corrección.** retries acotados + DLQ. **Señal observable.** mismo mensaje repite.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `0`, `1`.

### Tema 3: Schema Registry y evolución · Avanzado · 120 min

Caso guía: agregar campo sin romper consumidores.

#### Evolución de esquema

**Definición formal.** Schema Registry almacena versiones de esquemas (Avro/JSON Schema/Protobuf) y valida compatibilidad.

**Cuándo usarlo / cuándo no.** Úsalo con múltiples productores/consumidores. No hagas cambios incompatibles sin versión.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm10-schema
cd sm10-schema
```

Crea el archivo `Schema.java`:

```java
import java.util.*;
public class Schema {
  static boolean backwardCompatible(Set<String> oldFields, Set<String> newFields){ return newFields.containsAll(oldFields); }
  public static void main(String[] args){ System.out.println(backwardCompatible(Set.of("id"), Set.of("id","status"))); System.out.println(backwardCompatible(Set.of("id","status"), Set.of("id"))); }
}
```

```bash
javac Schema.java
java Schema
```

**Error común.** Borrar campo obligatorio.

**Síntoma.** consumidores fallan al deserializar. **Causa.** cambio incompatible. **Corrección.** compatibilidad backward/forward, deprecación. **Señal observable.** errores de schema tras deploy.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

### Tema 4: Idempotencia en consumidores · Avanzado · 120 min

Caso guía: duplicado de `OrderCreated`.

#### Idempotencia

**Definición formal.** Un consumidor idempotente aplica el mismo evento una vez aunque llegue varias veces.

**Cuándo usarlo / cuándo no.** Siempre en at-least-once.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm10-idem
cd sm10-idem
```

Crea el archivo `Idem.java`:

```java
import java.util.*;
public class Idem {
  static Set<String> seen = new HashSet<>();
  static String handle(String id){ return seen.add(id) ? "processed" : "duplicate"; }
  public static void main(String[] args){ System.out.println(handle("e1")); System.out.println(handle("e1")); }
}
```

```bash
javac Idem.java
java Idem
```

**Error común.** Asumir exactly-once del broker.

**Síntoma.** duplicados. **Causa.** reentregas. **Corrección.** dedup, constraints, outbox. **Señal observable.** mismo eventId aplicado dos veces.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `processed`, `duplicate`.

## Cierre

EDA requiere disciplina de contratos: claves de partición, DLQ, esquemas compatibles e idempotencia. Sin eso, el desacoplamiento se vuelve caos.

## Checklist

- Orden por clave cuando importa.
- DLQ y retries acotados.
- Esquemas compatibles versionados.
- Consumidores idempotentes.
