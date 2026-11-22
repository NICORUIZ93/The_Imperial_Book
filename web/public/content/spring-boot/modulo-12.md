# Módulo 12: Spring Batch

Batch procesa grandes volúmenes de datos de forma confiable, reanudable y observable. No es un `for` grande: es un sistema de jobs, steps, chunks, checkpoints, retries y idempotencia.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Spring Boot 3.5.0, Spring Batch.

## Aprende construyendo

### Tema 1: Jobs, steps y chunk processing · Avanzado · 45 min

Caso guía: importar 1M de registros sin cargar todo en memoria.

#### Job, Step, Chunk

**Definición formal.** Job es la ejecución completa; Step es una fase; chunk processing lee/procesa/escribe en bloques con commit por chunk.

```mermaid
flowchart LR
  R[ItemReader] --> P[ItemProcessor]
  P --> W[ItemWriter]
  W --> C[Commit por chunk]
  C --> R
```

**Error común.** Chunk demasiado grande o demasiado pequeño sin medir. Corrección: ajustar por memoria/latencia/transacción.

**Nota de verificación.** Requiere proyecto Spring Batch; lab ejecutable local.

### Tema 2: Reintentos, skip y idempotencia en batch · Avanzado · 45 min

Caso guía: 10 registros inválidos no deben tumbar todo el job; errores transitorios se reintentan.

#### Retry/Skip

**Definición formal.** Retry reintenta ítem/chunk ante error transitorio; skip omite ítems inválidos bajo política controlada.

**Regla.** Skip requiere registro/auditoría. Nunca saltar silenciosamente datos de negocio.

**Error común.** Job no idempotente: al reejecutar duplica datos. Corrección: claves naturales, checkpoints, tablas de estado.

### Tema 3: Scheduling, parámetros y operación · Avanzado · 40 min

Caso guía: ejecutar job nocturno con fecha de corte.

#### JobParameters

**Definición formal.** Parámetros que identifican y configuran una ejecución de job. Pueden hacer única una instancia de job.

**Error común.** Reejecutar job con mismos parámetros sin entender identidad de instancia. Corrección: parámetros de ejecución claros (`run.id`, fecha, ventana).

## Cierre

Batch confiable es chunking + checkpoints + idempotencia + observabilidad. Un job que no se puede reanudar es una bomba de tiempo.

## Checklist

- Uso chunk processing.
- Defino política de retry/skip con auditoría.
- Diseño idempotencia y reanudación.
- Parametrizo ejecuciones.
