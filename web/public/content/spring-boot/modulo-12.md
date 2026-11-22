# Módulo 12: Spring Batch

Spring Batch procesa grandes volúmenes de datos de forma confiable, reanudable y observable. No es un `for` grande: es un sistema de jobs, steps, chunks, checkpoints, retries, skips e idempotencia. El objetivo es terminar correctamente, o fallar de forma controlada y retomable.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Spring Boot 3.5.0. Spring Batch requiere dependencias y contexto Spring; los smokes de este módulo validan la lógica de chunking/retry/idempotencia en Java puro, y la ejecución completa de un job Spring Batch queda con nota de verificación honesta.

## Aprende construyendo

### Tema 1: Jobs, steps y chunk processing · Avanzado · 45 min

Caso guía: importar 1 millón de registros CSV a base de datos sin cargar todo en memoria y sin perder progreso si el proceso cae a mitad.

#### Definición formal

- **Job:** unidad completa de procesamiento batch. Tiene nombre, parámetros y ejecuciones.
- **Step:** fase de un job. Puede ser tasklet simple o chunk-oriented.
- **Chunk processing:** patrón donde el step lee ítems uno a uno, los procesa y los escribe en grupos (chunks). El commit de transacción ocurre por chunk.
- **ItemReader/ItemProcessor/ItemWriter:** contratos de lectura, transformación y escritura.

#### Contrato / internals

- El reader entrega ítems hasta agotar la fuente.
- El processor transforma/valida; puede devolver `null` para filtrar.
- El writer recibe una lista del tamaño del chunk.
- Cada chunk exitoso hace commit; el checkpoint permite reiniciar desde el último commit.
- Tamaño de chunk: demasiado grande aumenta memoria/tiempo de transacción; demasiado pequeño aumenta overhead de commits.

```mermaid
flowchart LR
  R[ItemReader] --> P[ItemProcessor]
  P --> W[ItemWriter]
  W --> C[Commit por chunk]
  C --> R
```

#### Cuándo usarlo / cuándo no

**Úsalo** para procesos masivos, ETL, importaciones, conciliaciones, facturación batch, donde necesitas reanudación y control transaccional. **No lo uses** para requests HTTP interactivos ni para volúmenes pequeños donde un script simple sea más claro.

#### Ejemplo mínimo ejecutable

Crea el archivo `ChunkSmoke.java`:

```java
import java.util.*;
public class ChunkSmoke {
  public static void main(String[] args) {
    List<Integer> input = List.of(1,2,3,4,5);
    int chunkSize = 2;
    List<List<Integer>> chunks = new ArrayList<>();
    for (int i = 0; i < input.size(); i += chunkSize) {
      chunks.add(input.subList(i, Math.min(i + chunkSize, input.size())));
    }
    System.out.println(chunks.size());
    System.out.println(chunks.get(0));
    System.out.println(chunks.get(2));
  }
}
```

```bash
javac ChunkSmoke.java
java ChunkSmoke
```

Salida esperada:

```text
3
[1, 2]
[5]
```

#### Caso real

Un job nocturno lee un CSV de pagos, valida formato, enriquece con cuenta interna y escribe en tabla `payments_imported`. Con chunk de 500, cada commit persiste 500 registros y el job puede reiniciar cerca del último checkpoint.

#### Error común

**Síntoma.** `OutOfMemoryError` o transacciones muy largas. **Causa.** cargar toda la entrada en memoria o chunk excesivo. **Corrección.** usar reader streaming y ajustar chunk size por medición. **Señal observable.** heap alto, commits lentos, locks largos en DB.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `3`, `[1, 2]`, `[5]`.

**Nota de verificación:** no se ejecutó un `Job` Spring Batch real en esta sesión. Verificación propuesta:

```bash
./mvnw -Dtest=*Batch* test
```

Resultado esperado: job completa con `COMPLETED`, contadores de read/write coherentes y commits por chunk.

### Tema 2: Reintentos, skip y idempotencia en batch · Avanzado · 45 min

Caso guía: durante la importación, algunos registros fallan por timeout transitorio a un servicio externo; otros fallan por formato inválido. Los transitorios deben reintentar; los inválidos deben registrarse y saltarse sin tumbar todo el job.

#### Definición formal

- **Retry:** volver a intentar el procesamiento de un ítem/chunk ante error transitorio.
- **Skip:** omitir un ítem que falla bajo una política definida, registrando la causa.
- **Idempotencia:** reejecutar el job o reprocesar un ítem no genera duplicados ni efectos inconsistentes.

#### Contrato / internals

- Retry aplica a errores recuperables (timeout, lock temporal, disponibilidad).
- Skip aplica a errores no recuperables por ítem (validación/formato).
- Todo skip debe quedar auditado: identificador, causa, timestamp, job execution.
- Idempotencia se logra con claves naturales, upserts, tabla de estado, o deduplicación por ID de negocio.
- Reanudación sin idempotencia puede duplicar efectos externos o inserts.

#### Cuándo usarlo / cuándo no

**Usa retry** para fallos transitorios con backoff y límite. **Usa skip** para datos inválidos aislados, con umbral máximo. **No uses skip** silencioso en datos financieros/críticos sin auditoría y decisión de negocio.

#### Ejemplo mínimo ejecutable

Crea el archivo `BatchRetrySkip.java`:

```java
import java.util.*;
public class BatchRetrySkip {
  enum Kind { OK, TRANSIENT, INVALID }
  record Item(String id, Kind kind) {}
  record Result(int written, int skipped) {}

  static Result run(List<Item> items) {
    int written = 0, skipped = 0;
    for (Item i : items) {
      int attempts = 0;
      boolean done = false;
      while (!done && attempts < 3) {
        attempts++;
        if (i.kind == Kind.OK) { written++; done = true; }
        else if (i.kind == Kind.TRANSIENT && attempts == 2) { written++; done = true; }
        else if (i.kind == Kind.TRANSIENT) { /* retry */ }
        else { skipped++; done = true; }
      }
      if (!done) skipped++;
    }
    return new Result(written, skipped);
  }

  public static void main(String[] args) {
    var r = run(List.of(
      new Item("A", Kind.OK),
      new Item("B", Kind.TRANSIENT),
      new Item("C", Kind.INVALID)
    ));
    System.out.println(r.written());
    System.out.println(r.skipped());
  }
}
```

```bash
javac BatchRetrySkip.java
java BatchRetrySkip
```

Salida esperada:

```text
2
1
```

#### Caso real

Un ítem con timeout a API externa se reintenta con backoff y termina OK. Un registro con RUT inválido se envía a tabla de rechazos con causa y el job continúa. El umbral de skip es 100; si se supera, el job falla.

#### Error común

**Síntoma.** reejecutar el job duplica filas. **Causa.** writer no idempotente y no hay clave natural/dedup. **Corrección.** usar `UPSERT`/clave única o tabla de control por ID de negocio. **Señal observable.** conteos de filas mayores en segunda ejecución con misma entrada.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `2`, `1`.

**Nota de verificación:** no se ejecutó Spring Batch con `RetryTemplate`/skip policy real. Verificación propuesta: job de prueba con `faultTolerant().retry(...).skip(...).skipLimit(...)` y assertions sobre `StepExecution`.

### Tema 3: Scheduling, parámetros y operación · Avanzado · 40 min

Caso guía: el job de conciliación se ejecuta cada noche con fecha de corte. Operaciones necesita reejecutarlo manualmente para una fecha específica sin afectar otras ejecuciones.

#### Definición formal

- **JobParameters:** parámetros que identifican/configuran una ejecución de job. Pueden hacer única la instancia del job.
- **Scheduling:** disparo del job por calendario (cron/fixed delay) o por evento.
- **JobInstance/JobExecution:** instancia lógica identificada por job+parámetros; ejecución concreta con estado, tiempos y contadores.

#### Contrato / internals

- Parámetros identificadores afectan la identidad del `JobInstance`; no identificadores solo configuran.
- Reejecutar la misma instancia completada puede ser rechazado según configuración; usar `run.id` u otro parámetro cuando se necesita nueva ejecución.
- Scheduling en múltiples instancias requiere lock (ShedLock/DB) para evitar ejecuciones duplicadas.
- Operación debe exponer métricas: duración, read/write/skip, estado, último éxito.

#### Cuándo usarlo / cuándo no

**Úsalo** para ventanas batch claras, con parámetros de corte y observabilidad. **No** uses cron sin idempotencia/lock en clúster; no mezcles lógica de negocio con parámetros ambiguos.

#### Ejemplo mínimo ejecutable

Crea el archivo `JobParams.java`:

```java
import java.util.*;
public class JobParams {
  static String jobKey(String date, String runId) {
    return "reconcile|" + date + "|" + runId;
  }
  public static void main(String[] args) {
    System.out.println(jobKey("2026-05-22", "1"));
    System.out.println(jobKey("2026-05-22", "2"));
  }
}
```

```bash
javac JobParams.java
java JobParams
```

Salida esperada:

```text
reconcile|2026-05-22|1
reconcile|2026-05-22|2
```

#### Caso real

`reconcileJob` recibe `cutoffDate=2026-05-22` y `run.id=manual-001`. El scheduler nocturno usa `run.id` basado en fecha; operaciones puede relanzar con otro `run.id` tras corregir datos.

#### Error común

**Síntoma.** “A job instance already exists and is complete...” al relanzar. **Causa.** mismos parámetros identificadores en un `JobInstance` ya completado. **Corrección.** definir estrategia: nuevo `run.id` para nueva ejecución, o `JobOperator.restart` cuando aplica a ejecución fallida. **Señal observable.** excepción de instancia de job al disparar manualmente.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `reconcile|2026-05-22|1`, `reconcile|2026-05-22|2`.

**Nota de verificación:** no se ejecutó scheduler Spring Batch real. Verificación propuesta: test con `JobLauncherTestUtils` pasando `JobParameters` y validando `JobExecution`/reinicio.

## Cierre

Spring Batch es útil cuando el volumen, la reanudación y la auditabilidad importan. Un batch bien diseñado es chunked, idempotente, observable y operable: puede fallar sin corromper datos y puede reanudarse con evidencia.

## Checklist

- Job/step/chunk definidos según volumen y transacción.
- Retry para transitorios, skip auditado para inválidos.
- Idempotencia verificada en reejecución.
- JobParameters claros para operación/restart.
- Métricas y logs de ejecución disponibles.