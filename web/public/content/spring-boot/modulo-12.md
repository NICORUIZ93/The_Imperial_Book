# Módulo 12: Spring Batch: jobs, chunks y procesamiento masivo

Cubre procesamiento batch: jobs, steps, chunk processing, idempotencia, reintentos y scheduling.

**Entorno (2026-05-22):** JDK 27, Maven 3.10.0. Spring Batch requiere contexto Boot/BD de metadatos.

## Aprende construyendo

### Tema 1: Jobs, steps y chunk processing · Avanzado · 45 min
#### Job/Step
**Definición formal.** Job es una unidad de procesamiento batch compuesta por steps; cada step ejecuta una fase.
**Para qué sirve.** Estructurar procesos masivos.
**Cuándo usarlo.** ETL, conciliaciones, cargas masivas.
**Ejemplo mínimo enfocado (conceptual).** `JobBuilderFactory`/`JobBuilder` + `StepBuilder`.
**Caso de uso real.** Importar CSV nocturno.
**Error común.** Cargar todo en memoria. Corrección: chunk processing.
**Verificación.** **Nota:** requiere Spring Batch.

#### Chunk
**Definición formal.** Procesamiento por lotes: lee items, procesa, escribe en chunks transaccionales.
**Para qué sirve.** Escalabilidad y control transaccional.
**Cuándo usarlo.** Grandes volúmenes.
**Ejemplo mínimo enfocado (ejecutable simulación).**
```bash
mkdir -p /tmp/sb12-chunk && cd /tmp/sb12-chunk
cat > DemoChunk.java << 'JAVA'
import java.util.*; public class DemoChunk { public static void main(String[] args){ var data=List.of(1,2,3,4,5); for(int i=0;i<data.size();i+=2){ System.out.println(data.subList(i,Math.min(i+2,data.size()))); } } }
JAVA
javac DemoChunk.java && java DemoChunk
```
**Caso de uso real.** Escribir 1000 registros por commit.
**Error común.** Chunk demasiado grande. Corrección: medir y ajustar.
**Verificación (JDK 27, 2026-05-22).** Salida: `[1, 2]`, `[3, 4]`, `[5]`.

### Tema 2: Reintentos, skip y idempotencia en batch · Avanzado · 45 min
#### Retry/Skip
**Definición formal.** Retry reintenta un item/chunk ante fallo transitorio; skip omite items fallidos según política.
**Para qué sirve.** Robustez en procesos largos.
**Cuándo usarlo.** Errores transitorios o registros corruptos controlados.
**Ejemplo mínimo enfocado (conceptual).** `faultTolerant().retry(...).skip(...)`.
**Caso de uso real.** Reintentar timeout, saltar fila inválida con log.
**Error común.** Skip silencioso. Corrección: registrar y auditar.
**Verificación.** **Nota:** requiere Spring Batch.

#### Idempotencia batch
**Definición formal.** Reejecutar job/step produce mismo efecto sin duplicar datos.
**Para qué sirve.** Recuperación segura.
**Cuándo usarlo.** Siempre en jobs reejecutables.
**Ejemplo mínimo enfocado.** clave natural + upsert/tabla de control.
**Caso de uso real.** Reprocesar archivo diario.
**Error común.** Insert ciego en reejecución. Corrección: claves idempotentes.
**Verificación.** **Nota:** depende de diseño de datos.

### Tema 3: Scheduling, parámetros y operación · Avanzado · 40 min
#### Job parameters
**Definición formal.** Parámetros que identifican/configuran una ejecución de job.
**Para qué sirve.** Reejecución controlada y trazabilidad.
**Cuándo usarlo.** Jobs periódicos con fecha/id de lote.
**Ejemplo mínimo enfocado (conceptual).** `run.id`, `fecha`.
**Caso de uso real.** Proceso diario por fecha.
**Error común.** Parámetros no deterministas que impiden re-run. Corrección: diseñar parámetros de negocio.
**Verificación.** **Nota:** requiere Spring Batch.

## Cierre
Batch es sobre volumen, control transaccional y reejecución segura. Diseña idempotencia y observabilidad desde el día 1.
