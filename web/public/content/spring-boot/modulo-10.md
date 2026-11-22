# Módulo 10: Kafka con Spring Boot

Kafka es un log distribuido para eventos y streams. Con Spring for Kafka puedes producir y consumir mensajes con poca ceremonia, pero la dificultad real está en la semántica de entrega: orden por clave, duplicados, reintentos, DLT, consistencia DB-evento y evolución de esquemas.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Spring Boot 3.5.0. Docker 29.9.3 está disponible en el entorno, pero no se levantó un broker Kafka/Schema Registry en esta sesión; los smokes de concepto son Java puro y las integraciones Kafka reales quedan con nota de verificación honesta.

## Aprende construyendo

### Tema 1: Productor, consumidor y claves de partición · Intermedio · 40 min

Caso guía: el servicio publica eventos `GuiaCreada` y el consumidor debe procesar en orden todos los eventos de la misma guía.

#### Definición formal

Un **topic** es un log nombrado y particionado. Una **partición** es una secuencia ordenada append-only. Un **producer** escribe registros; un **consumer** lee desde offsets; un **consumer group** reparte particiones entre consumidores. La **clave** del registro se usa para elegir partición y, por tanto, define el orden garantizado.

#### Contrato / internals

- **Orden:** Kafka garantiza orden dentro de una partición, no orden global entre particiones.
- **Key:** misma key -> misma partición (mientras no cambie el número de particiones/hash mapping).
- **Offset:** posición del consumidor en la partición; commit de offset marca progreso.
- **Entrega:** por defecto se diseña para at-least-once; el consumidor debe tolerar duplicados.
- **Spring Kafka:** `KafkaTemplate.send(topic, key, value)` produce; `@KafkaListener` consume.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando necesitas desacoplar productores/consumidores, alto throughput y replay por offset. **No lo uses** como base de datos transaccional ni asumas orden global sin diseñar particionado.

#### Ejemplo mínimo ejecutable

Crea el archivo `Partitioning.java`:

```java
public class Partitioning {
  static int partition(String key, int partitions) {
    return Math.floorMod(key.hashCode(), partitions);
  }

  public static void main(String[] args) {
    int p1 = partition("G1", 3);
    int p2 = partition("G1", 3);
    int p3 = partition("G2", 3);
    System.out.println(p1 == p2);
    System.out.println(p3 >= 0 && p3 < 3);
  }
}
```

```bash
javac Partitioning.java
java Partitioning
```

Salida esperada:

```text
true
true
```

#### Caso real

`GuiaCreada` y `GuiaEntregada` se publican con key `guiaId`. Así, todos los eventos de la misma guía van a la misma partición y se consumen en orden relativo.

#### Error común

**Síntoma.** eventos de la misma entidad se procesan fuera de orden. **Causa.** key aleatoria o nula y se asume orden global. **Corrección.** usar key de agregado (`guiaId`) y diseñar consumidores idempotentes. **Señal observable.** `GuiaEntregada` procesado antes que `GuiaCreada`.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `true`.

**Nota de verificación:** no se ejecutó broker Kafka real. Verificación propuesta:

```bash
docker run --rm -p 9092:9092 apache/kafka:3.9.0
# configurar spring.kafka.bootstrap-servers=localhost:9092
./mvnw test -Dtest=*Kafka* 
```

Resultado esperado: mensajes con misma key caen en la misma partición y el consumidor los procesa en orden por partición.

### Tema 2: Idempotencia, retries y DLT · Avanzado · 45 min

Caso guía: un consumidor falla por timeout a DB (transitorio) y luego por payload inválido (permanente). No debe bloquear la partición para siempre ni perder el mensaje.

#### Definición formal

- **At-least-once:** el mensaje puede entregarse más de una vez.
- **Idempotencia de consumidor:** procesar el mismo mensaje dos veces produce el mismo efecto que procesarlo una vez.
- **Retry:** reintento controlado ante fallos transitorios.
- **DLT (Dead Letter Topic):** topic donde se envían mensajes que exceden política de reintentos o son no recuperables.

#### Contrato / internals

- Kafka puede redeliverar por rebalanceo, fallo antes de commit o timeout.
- Retries deben distinguir transitorio vs permanente.
- DLT requiere metadata: causa, payload original, topic/partition/offset, timestamp.
- Idempotencia se implementa con clave de negocio, tabla inbox/dedup o constraint único.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre que consumas con at-least-once. **No** hagas retry infinito ni reintentes errores deterministas. **No** confíes en “exactly-once” sin entender el alcance (transacción Kafka+Kafka no es lo mismo que Kafka+DB).

#### Ejemplo mínimo ejecutable

Crea el archivo `RetryPolicy.java`:

```java
import java.util.*;
public class RetryPolicy {
  enum Action { RETRY, DLT }
  static Action decide(boolean transientError, int attempt, int max) {
    if (!transientError) return Action.DLT;
    return attempt < max ? Action.RETRY : Action.DLT;
  }
  public static void main(String[] args) {
    System.out.println(decide(true, 1, 3));
    System.out.println(decide(false, 1, 3));
    System.out.println(decide(true, 3, 3));
  }
}
```

```bash
javac RetryPolicy.java
java RetryPolicy
```

Salida esperada:

```text
RETRY
DLT
DLT
```

#### Caso real

Spring Kafka configura `DefaultErrorHandler` con backoff y `DeadLetterPublishingRecoverer`. El consumidor valida si `eventId` ya fue procesado en tabla `inbox`.

#### Error común

**Síntoma.** la partición queda atascada por un mensaje inválido. **Causa.** retry infinito sobre error permanente. **Corrección.** clasificar errores, limitar intentos, enviar a DLT y alertar. **Señal observable.** lag crece y el mismo offset se repite en logs.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `RETRY`, `DLT`, `DLT`.

**Nota de verificación:** no se ejecutó Kafka DLT real. Verificación propuesta con Spring Kafka + Testcontainers: publicar mensaje inválido, verificar reintentos y llegada a `<topic>.DLT`.

### Tema 3: Outbox, inbox y duplicados reales · Avanzado · 45 min

Caso guía: al crear una guía, debes guardar en DB y publicar evento a Kafka. Si haces dual write sin coordinación, puedes perder o duplicar efectos.

#### Definición formal

- **Outbox:** tabla donde se persiste el evento a publicar dentro de la misma transacción de negocio.
- **Publisher/relay:** proceso que lee outbox y publica a Kafka.
- **Inbox/dedup:** tabla/registro para detectar eventos ya procesados por el consumidor.
- **Dual write:** escribir en DB y broker como operaciones independientes; vulnerable a fallos entre ambas.

#### Contrato / internals

- Transacción DB garantiza atomicidad entre estado de negocio y fila outbox.
- El publisher puede publicar duplicados; Kafka entrega at-least-once; por eso inbox/idempotencia es obligatoria.
- Outbox no elimina duplicados: los hace manejables.
- La clave de dedup debe ser estable (`eventId`/`aggregateId+version`).

#### Cuándo usarlo / cuándo no

**Úsalo** cuando el cambio de negocio y la publicación de evento deben ser consistentes. **No** hagas DB+Kafka directos sin outbox si perder evento o publicar evento fantasma es inaceptable.

#### Ejemplo mínimo ejecutable

Crea el archivo `OutboxFlow.java`:

```java
import java.util.*;
public class OutboxFlow {
  static class Db {
    boolean businessSaved = false;
    boolean outboxSaved = false;
  }
  static boolean commit(boolean failAfterBusiness) {
    Db db = new Db();
    db.businessSaved = true;
    if (failAfterBusiness) return false;
    db.outboxSaved = true;
    return db.businessSaved && db.outboxSaved;
  }
  public static void main(String[] args) {
    System.out.println(commit(false));
    System.out.println(commit(true));
  }
}
```

```bash
javac OutboxFlow.java
java OutboxFlow
```

Salida esperada:

```text
true
false
```

#### Caso real

La transacción guarda `guia` y `outbox_event`. Un poller publica a Kafka y marca el evento como enviado. El consumidor registra `eventId` en inbox antes de aplicar efecto.

#### Error común

**Síntoma.** DB tiene el cambio pero nunca se emitió evento. **Causa.** dual write: DB commit OK, publish Kafka falla. **Corrección.** outbox transaccional + relay + idempotencia. **Señal observable.** registros en DB sin evento en topic.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó outbox con DB/Kafka real. Verificación propuesta: Testcontainers Postgres+Kafka, simular fallo tras commit DB y confirmar que relay publica evento pendiente.

### Tema 4: Evolución de esquemas y Schema Registry · Avanzado · 45 min

Caso guía: el evento `GuiaCreada` necesita un nuevo campo `priority`. Productores y consumidores se despliegan en momentos distintos.

#### Definición formal

La evolución de esquemas es el proceso de cambiar la estructura de mensajes preservando compatibilidad entre versiones. Un **Schema Registry** almacena esquemas y valida reglas de compatibilidad (backward, forward, full).

#### Contrato / internals

- **Backward:** consumidor nuevo puede leer datos viejos.
- **Forward:** consumidor viejo puede leer datos nuevos.
- **Full:** ambas direcciones.
- Cambios seguros dependen del formato (Avro/Protobuf/JSON Schema) y reglas: agregar campo opcional con default suele ser seguro; quitar/renombrar sin plan no.
- El contrato debe versionarse y probarse en CI.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando múltiples servicios consumen eventos y despliegan independientemente. **No** hagas cambios incompatibles sin ventana de migración, versión o consumidor tolerante.

#### Ejemplo mínimo ejecutable

Crea el archivo `SchemaCompat.java`:

```java
import java.util.*;
public class SchemaCompat {
  static boolean backwardCompatible(boolean addedFieldHasDefault) {
    return addedFieldHasDefault;
  }
  public static void main(String[] args) {
    System.out.println(backwardCompatible(true));
    System.out.println(backwardCompatible(false));
  }
}
```

```bash
javac SchemaCompat.java
java SchemaCompat
```

Salida esperada:

```text
true
false
```

#### Caso real

Se agrega `priority` con default `NORMAL` en Avro. Consumidores viejos ignoran o toleran el campo; consumidores nuevos leen eventos viejos con default.

#### Error común

**Síntoma.** consumidores fallan al deserializar tras deploy. **Causa.** cambio incompatible sin default/regla de compatibilidad. **Corrección.** Schema Registry, reglas de compatibilidad y tests de contrato. **Señal observable.** errores de deserialización masivos tras cambio de esquema.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó Schema Registry/Avro real. Verificación propuesta: levantar Kafka + Schema Registry, registrar v1/v2 y validar compatibilidad con producer/consumer de prueba.

## Cierre

Kafka en Spring Boot exige pensar en entrega, no solo en enviar mensajes. Clave de partición define orden, idempotencia/DLT manejan fallos, outbox/inbox protegen consistencia y Schema Registry permite evolucionar contratos sin romper consumidores.

## Checklist

- Key de partición definida por agregado/orden requerido.
- Consumidor idempotente y con DLT.
- Outbox/inbox para consistencia DB-evento.
- Compatibilidad de esquemas validada antes de deploy.
- Notas de verificación honestas cuando falta broker/registry.