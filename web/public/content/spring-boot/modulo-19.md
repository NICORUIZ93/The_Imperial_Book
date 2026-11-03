# Módulo 19: Spring Batch — jobs, chunks y procesamiento masivo

## Aprende construyendo

Construirás un job que importa pedidos desde CSV, valida y transforma cada fila, y persiste resultados por lotes. Después ensayarás reinicio y políticas de error con datos deliberadamente inválidos. El objetivo es procesamiento reanudable, observable y acotado en memoria.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** importa tres filas CSV con chunk de dos; una fila inválida se registra y la escritura del chunk falla o confirma completa.
- **Caso RutaFlow:** reconcilia cientos de miles de tarifas con archivo identificado por checksum y `JobParameters` estables. Guarda rechazados para conciliación, registra leídos/escritos/omitidos, y reinicia la misma instancia tras una caída sin duplicar registros por la clave natural.

Compara los límites de transacción y el consumo de memoria con más de un chunk. No confundas `skip` con una salida silenciosa: cada fila excluida necesita causa y evidencia.

### Tema 1: Job, Step, Tasklet y chunk processing · Avanzado · 1 h 40 min

**Prerrequisito:** Módulo 18 de este track, JDK 27+ y Maven.

**Al terminar podrás:** distinguir un `Job`, un `Step`, un `Tasklet` y un step orientado a chunks, y ejecutar un job reproducible.

#### Aprende

Cada noche se importa un archivo de pedidos. Cargarlo completo en una lista puede agotar memoria; detenerse al primer error obliga a rehacer manualmente el lote entero.

**¿Por qué es importante?** Un procesamiento por chunks acota memoria y hace que el punto de confirmación pueda observarse y recuperarse.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `JobParameters` estables | Prerrequisito | En el test se configura `inputFile=classpath:pedidos.csv` para lanzar el job mediante `JobLauncherTestUtils`. |
| Modelo chunk (`chunk(2, transactionManager)`) | Núcleo | El step `importarPedidos` agrupa de a dos filas y confirma cada chunk dentro de la transacción. |
| `ItemReader` / `ItemProcessor` / `ItemWriter` | Núcleo | `FlatFileItemReader` lee `pedidos.csv`, el processor filtra y `JdbcPedidoWriter` escribe el `Chunk`. |
| `Tasklet` frente a step chunk | Variante | La consigna pide un `Tasklet` que registre el resumen final sin procesar filas, frente al step que procesa cada fila. |
| Frontera transaccional del chunk | Límite | Un error en el writer revierte las escrituras de ese chunk, y `chunk(1, ...)` multiplica commits en el log. |
| Processor que retorna `null` | Error frecuente | `RF-1002` con importe cero se filtra y aparecen menos filas escritas que leídas si no se cuenta el filtrado. |
| Reader paginado (`JdbcPagingItemReader`) | Decisión | Se añade para leer desde una tabla sin materializar todos los resultados y mantener la memoria acotada. |
| `JobRepository` y metadatos | Diagnóstico | Mantiene instancias y ejecuciones; el conteo de commits en el log confirma qué define el tamaño del chunk. |

Cada fila tiene su explicación individual a continuación.

**`JobParameters` estables (prerrequisito).** Los parámetros identifican una ejecución lógica, por lo que deben incluir valores estables como la fecha de archivo y no una hora aleatoria. En el laboratorio se fija `inputFile=classpath:pedidos.csv` como JobParameter para que el test lance el job con `JobLauncherTestUtils` de forma reproducible. Sin parámetros estables no se puede reanudar una instancia, que es la base del Tema 2.

**Modelo chunk (`chunk(2, transactionManager)`) (núcleo).** El modelo chunk lee, procesa y escribe un bloque dentro de límites transaccionales, de modo que cada chunk confirmado queda persistido. En el ejemplo el step `importarPedidos` usa `chunk(2, transactionManager)`, así que las filas se confirman de a dos dentro de la transacción del step. El tamaño del chunk define el grupo de escrituras que se confirma junto, y variar ese número cambia cuántas transacciones se abren.

**`ItemReader` / `ItemProcessor` / `ItemWriter` (núcleo).** El reader obtiene registros, el processor transforma o filtra y el writer escribe el chunk. Aquí `FlatFileItemReader` lee `pedidos.csv` saltando la cabecera, el `ItemProcessor` descarta importes no positivos y `JdbcPedidoWriter` recorre el `Chunk<? extends PedidoImportado>` haciendo `insert` por fila. El writer corre dentro de la transacción del chunk, por lo que su éxito o fallo está ligado al límite transaccional.

**`Tasklet` frente a step chunk (variante).** Un `Tasklet` sirve para una tarea acotada que se ejecuta de una sola vez, como marcar el inicio de la importación o registrar el resumen final. El tema pide implementar dos steps y comparar un `Tasklet` que registra el resumen con un step chunk que procesa cada fila. La distinción importa porque el `Tasklet` no itera elementos ni define el agrupamiento de confirmaciones.

**Frontera transaccional del chunk (límite).** La transacción del step delimita qué escrituras se confirman o revierten juntas. El resultado esperado indica que un error en el writer debe revertir las escrituras de ese chunk, y el fallo deliberado compara commits y logs entre `chunk(1, ...)` y `chunk(2, ...)`. Ese límite es lo que hace observable y recuperable el punto de confirmación.

**Processor que retorna `null` (error frecuente).** Un `ItemProcessor` que retorna `null` filtra intencionalmente el elemento y no debe confundirse con una fila que falló. En el ejemplo `RF-1002` con importe cero se filtra, de modo que solo `RF-1001` y `RF-1003` se guardan. Sin un listener que cuente los filtrados, el reporte de "filas escritas" no explica por qué hay menos que las leídas.

**Reader paginado (`JdbcPagingItemReader`) (decisión).** Cuando el origen es una tabla grande, materializar todos los resultados agota memoria. El tema añade `JdbcPagingItemReader` para leer sin cargar toda la tabla y verificar que la memoria no crece linealmente con el total de filas. La decisión depende del tamaño de página y de que la consulta se resuelva contra la base de datos.

**`JobRepository` y metadatos (diagnóstico).** El `JobRepository` mantiene metadatos de instancias y ejecuciones, que sirven para diagnosticar qué ocurrió en el lote. La pista del tema usa el conteo de confirmaciones en el log: si al subir el `chunkSize` por encima del total de filas válidas los commits bajan a uno, se confirma que es el tamaño del chunk —y no el `Tasklet`— lo que define cuántas filas se confirman juntas. Ese registro observable es la evidencia para diagnosticar la causa.

Un `Job` coordina la ejecución; sus `Step`s separan fases. Un `Tasklet` sirve para una tarea acotada (por ejemplo, marcar inicio de importación). El modelo chunk lee elementos, los procesa y escribe un bloque dentro de límites transaccionales: cada chunk confirmado queda persistido.

`ItemReader` obtiene registros; `ItemProcessor` transforma o filtra; `ItemWriter` escribe un chunk. `JobRepository` mantiene metadatos de instancias y ejecuciones. `JobParameters` identifican una ejecución lógica y deben incluir parámetros estables como fecha de archivo, no una hora aleatoria que impida reanudar.

**Analogía:** un `Job` es la receta completa de un menú; cada `Step` es un plato de esa receta. Un `Tasklet` es un paso que se hace de una sola vez (encender el horno); el *chunk processing* es una cadena de montaje que toma ingredientes de a lotes, los cocina y los emplata en grupos, en vez de uno por uno.

#### Practica

Genera un proyecto Spring Boot desde Initializr con `batch`, `jdbc` y `h2`.

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/batch/ImportJobConfig.java` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

Incluye `src/main/resources/pedidos.csv` con:

```text
referencia,importe
RF-1001,125.50
RF-1002,0
RF-1003,49.99
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

Crea `PedidoImportado` como record y `src/main/java/academia/batch/ImportJobConfig.java`. Configura `schema.sql` con una tabla destino `pedido_importado(referencia varchar(40) primary key, importe decimal(12,2) not null)`. Declara estos beans de reader y processor; el archivo se inyecta por parámetro del job:

```java
@Bean
@StepScope
FlatFileItemReader<PedidoImportado> reader(
        @Value("#{jobParameters['inputFile']}") Resource input) {
    return new FlatFileItemReaderBuilder<PedidoImportado>()
        .name("pedidoReader")
        .resource(input)
        .linesToSkip(1)
        .delimited()
        .names("referencia", "importe")
        .fieldSetMapper(fields -> new PedidoImportado(
            fields.readString("referencia"),
            fields.readBigDecimal("importe")))
        .build();
}

@Bean
ItemProcessor<PedidoImportado, PedidoImportado> processor() {
    return pedido -> pedido.importe().signum() > 0 ? pedido : null;
}
```

Un processor que retorna `null` filtra intencionalmente el elemento; registra el conteo filtrado en listener, no lo confundas con una escritura.

**Construye el writer y el step.** Para este primer laboratorio, `JdbcPedidoWriter` implementa `ItemWriter<PedidoImportado>` y recorre el `Chunk<? extends PedidoImportado>` llamando a `JdbcTemplate.update("insert into pedido_importado(referencia, importe) values (?, ?)", pedido.referencia(), pedido.importe())`. El step ejecuta el writer dentro de la transacción del chunk, así que el tamaño del chunk define el grupo de escrituras que se confirma junto.

El núcleo del step en Spring Batch moderno usa builder inyectado:

```java
@Bean
Step importarPedidos(
        JobRepository jobRepository,
        PlatformTransactionManager transactionManager,
        ItemReader<PedidoImportado> reader,
        ItemProcessor<PedidoImportado, PedidoImportado> processor,
        ItemWriter<PedidoImportado> writer) {
    return new StepBuilder("importarPedidos", jobRepository)
        .<PedidoImportado, PedidoImportado>chunk(2, transactionManager)
        .reader(reader)
        .processor(processor)
        .writer(writer)
        .build();
}
```

Define `Job` con `new JobBuilder("importPedidos", jobRepository).start(importarPedidos).build()`. Para ejecutar el archivo del classpath, configura temporalmente `inputFile=classpath:pedidos.csv` como JobParameter en el test. Ejecuta `./mvnw test` con un test `@SpringBatchTest` o de integración que lance el job mediante `JobLauncherTestUtils`.

**Resultado esperado:** `RF-1001` y `RF-1003` se guardan en `pedido_importado`; el registro con importe cero se filtra. **Fallo deliberado:** usa `chunk(1, ...)` y compara commits/logs con `chunk(2, ...)`; provoca además un error de parseo y observa qué chunk se revierte. Un error en el writer debe revertir las escrituras de ese chunk.

Implementa dos steps: validar archivo y luego importar. Compara `Tasklet` para registrar el resumen final con un step chunk para procesar cada fila. Añade un reader JDBC paginado (`JdbcPagingItemReader`) para leer desde una tabla sin materializar todos los resultados.

**Pista:** cambia temporalmente el `chunkSize` de 2 a un valor mayor que el total de filas válidas y vuelve a correr el test; si el número de confirmaciones en el log baja a una sola, confirmas que es el tamaño del chunk —y no el `Tasklet`— lo que define cuántas filas se confirman juntas en cada transacción.

#### Aplica

Construye importación de tarifas de RutaFlow con `FlatFileItemReader`, processor que normalice códigos y writer persistente con `JdbcBatchItemWriter`. Agrega conteos leídos, filtrados, escritos y fallidos. Verifica que la memoria usada no crece linealmente con el total de filas.

**Checklist de salida.**

- [ ] El job `importPedidos` lee `pedidos.csv` con `FlatFileItemReader` y salta la cabecera.
- [ ] `RF-1001` y `RF-1003` quedan en `pedido_importado` y el importe cero se filtra con el processor.
- [ ] El step usa `chunk(2, transactionManager)` y el writer escribe dentro de la transacción del chunk.
- [ ] Un error en el writer revierte las escrituras de ese chunk.
- [ ] El reader paginado (`JdbcPagingItemReader`) no materializa toda la tabla.
- [ ] Un `Tasklet` registra el resumen final sin procesar filas.

**Si falla.** Si aparecen menos filas escritas que leídas, el processor filtró registros: registra el conteo filtrado en el listener antes de buscar un error de escritura. Si un error de parseo no revierte el chunk, comprueba que el writer corre dentro de la transacción del step y que no hay autocommit en la conexión. Si el lector paginado carga toda la tabla, revisa el tamaño de página y que la consulta se resuelva contra la base de datos. Si con `chunk(1, ...)` aumentan commits y costo, el tamaño del chunk es la causa: vuelve al valor que agrupa las filas esperadas.

Entrega job, archivo fixture, test del step y conteos del lote como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no elijas Batch para una petición HTTP inmediata y pequeña; una cola/eventos o una operación síncrona pueden ser más apropiadas.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** usar `chunk(1, ...)` en producción pensando que así se evitan problemas, cuando en realidad multiplica el número de transacciones y el costo por fila, y confundir un `ItemProcessor` que retorna `null` (filtra el registro) con una fila que falló: sin un listener que cuente los filtrados, el reporte de "filas escritas" no explica por qué hay menos que las leídas.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 2: Reinicio, JobParameters, retry, skip y listeners · Avanzado · 1 h 20 min

**Prerrequisito:** Tema 1 de este módulo; continúa con su job y su archivo de pedidos.

**Al terminar podrás:** reanudar un job fallido desde su estado guardado, distinguir errores recuperables de registros inválidos y auditar el resultado del lote.

#### Aprende

El job procesó 80 000 filas cuando el sistema perdió conectividad. Reiniciar desde cero puede duplicar efectos; saltar silenciosamente cualquier error hace que la conciliación sea imposible.

**¿Por qué es importante?** Un lote reanudable evita repetir todo el trabajo y permite conciliar resultados cuando un proceso falla a mitad de camino.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Identidad de instancia (`JobParameters`) | Prerrequisito | El test reutiliza `inputFile=pedidos.csv` y `runDate=2026-10-13` para relanzar la misma instancia lógica. |
| Reanudación desde el estado guardado | Núcleo | Tras forzar una falla en el primer chunk, el chunk confirmado no se duplica y el job completa al reanudar. |
| `skip` acotado (`FlatFileParseException`) | Variante | `.skip(FlatFileParseException.class)` con `skipLimit(5)` excluye filas de parseo registrando referencia y causa. |
| `retry` con límite (`TransientDataAccessException`) | Variante | `.retry(TransientDataAccessException.class)` con `retryLimit(3)` reintenta solo fallos transitorios. |
| Idempotencia de efectos externos | Límite | Al reanudar tras marcar un email como "enviado", si se reenvía hace falta outbox o clave de idempotencia. |
| `skip` mal aplicado a infraestructura | Error frecuente | Marcar una pérdida de conectividad como `skip` descarta filas recuperables que correspondían a `retry`. |
| Nueva instancia por `run.id` cambiante | Diagnóstico | Generar un `run.id` nuevo en el segundo intento crea una instancia que vuelve a iniciar el archivo. |
| Listener de auditoría del lote | Decisión | El listener reporta filas omitidas y filtradas por separado sin reemplazar transacciones ni manejo de errores. |

Cada fila tiene su explicación individual a continuación.

**Identidad de instancia (`JobParameters`) (prerrequisito).** Una instancia de job se identifica por su nombre y sus parámetros de identificación, y sus ejecuciones registran estado y contexto. El laboratorio ejecuta el job con `inputFile=pedidos.csv` y `runDate=2026-10-13`, y relanza la misma instancia lógica tras forzar la falla. Si los parámetros de identificación cambian, la reanudación no apunta a la ejecución previa.

**Reanudación desde el estado guardado (núcleo).** La reanudación aprovecha el estado persistido para no repetir el trabajo ya confirmado, siempre que reader/writer y efectos externos sean compatibles con reinicio. El test fuerza una falla tras el primer chunk y vuelve a lanzar la misma instancia; el resultado esperado es que el chunk confirmado no se duplique y el job complete. Ese comportamiento es lo que distingue reanudar de empezar de cero.

**`skip` acotado (`FlatFileParseException`) (variante).** `skip` aplica a datos no recuperables dentro de un límite y debe registrar la fila excluida. En el código se limita con `.skip(FlatFileParseException.class)` y `skipLimit(5)`, y la consigna pide registrar referencia y causa sin almacenar datos sensibles. Es una variante del control de errores distinta de `retry`, pensada para filas inválidas que el negocio permite excluir.

**`retry` con límite (`TransientDataAccessException`) (variante).** `retry` aplica a fallos transitorios con límite y backoff, no a cualquier excepción. El step lo acota con `.retry(TransientDataAccessException.class)` y `retryLimit(3)`, reservándolo para errores temporales de base. La consigna advierte explícitamente que no se debe clasificar toda excepción como retryable.

**Idempotencia de efectos externos (límite).** Una transacción de base de datos no deshace un efecto externo ya emitido, así que un envío de email o evento debe ser idempotente para no duplicarse al reanudar. La pista simula marcar un email como "enviado" o publicar un evento y luego fuerza que la escritura del chunk falle justo después; si al reanudar el efecto se repite, ese es el caso que necesita outbox o una clave de idempotencia. Ese es el límite de lo que la transacción del chunk puede proteger.

**`skip` mal aplicado a infraestructura (error frecuente).** Confundir un fallo de infraestructura con un dato inválido lleva a descartar filas que sí eran recuperables. El tema señala que una pérdida de conectividad marcada como `skip` debe clasificarse como `retry`, porque `skip` es para datos no recuperables. Aplicar `skip` a infraestructura rompe la conciliación al eliminar registros válidos.

**Nueva instancia por `run.id` cambiante (diagnóstico).** Generar un `run.id` o parámetro distinto en cada reintento crea una instancia nueva en vez de reanudar la anterior. El fallo deliberado del tema produce exactamente ese síntoma: con un `run.id` nuevo se observa una instancia que vuelve a iniciar el archivo desde cero. Reconocer ese reinicio completo permite diagnosticar que los parámetros de identificación no se reutilizaron.

**Listener de auditoría del lote (decisión).** El listener observa inicio y fin para métricas, pero no reemplaza transacciones ni el manejo de errores. En el laboratorio reporta filas omitidas y filtradas por separado, lo que permite auditar el resultado del lote. Decidir qué registra el listener es clave para que la conciliación distinga un `skip` de un filtrado del processor.

Una instancia de job se identifica por nombre y parámetros de identificación; sus ejecuciones registran estado y contexto. La reanudación requiere que reader/writer y efectos externos sean compatibles con reinicio. `skip` aplica a datos no recuperables dentro de un límite y debe registrar la fila; `retry` aplica a fallos transitorios con límite/backoff. No clasifiques toda excepción como retryable.

El listener observa inicio/fin para métricas, pero no reemplaza transacciones ni manejo de errores. Un efecto externo debe tener idempotencia para no duplicarse si el job reinicia después de enviarlo.

**Analogía:** reiniciar un batch es como retomar una serie donde la dejaste, no desde el capítulo uno: los `JobParameters` son el marcador que recuerda dónde ibas. `retry` es volver a intentar una escena que salió mal; `skip` es saltarse un fotograma dañado para no frenar toda la reproducción; y los `listeners` son las notas al margen que registran qué pasó en cada tramo.

#### Practica

Continúa en la carpeta del Tema 1 y abre `src/main/java/academia/batch/ImportJobConfig.java`.

**Crea** el archivo `src/main/java/academia/batch/ImportJobConfig.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

En `src/main/java/academia/batch/ImportJobConfig.java`, limita el retry a fallos transitorios y el skip a errores de parseo que el negocio permita excluir:

```java
return new StepBuilder("importarPedidos", jobRepository)
    .<PedidoImportado, PedidoImportado>chunk(2, transactionManager)
    .reader(reader)
    .processor(processor)
    .writer(writer)
    .faultTolerant()
    .retry(TransientDataAccessException.class)
    .retryLimit(3)
    .skip(FlatFileParseException.class)
    .skipLimit(5)
    .listener(importMetricsListener)
    .build();
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

Ejecuta el job con `JobParameters` que incluyan `inputFile=pedidos.csv` y `runDate=2026-10-13`; configura el test para forzar una falla tras el primer chunk y volver a lanzar **la misma instancia lógica**. Ejecuta `./mvnw test -Dtest=ImportJobRestartTest`.

**Resultado esperado:** el primer chunk confirmado no se duplica, el job completa al reanudarse y el listener reporta filas omitidas explícitamente. **Fallo deliberado:** genera un `run.id` nuevo para el segundo intento; observarás una nueva instancia que vuelve a iniciar el archivo. Compara con el reinicio de la misma instancia y explica la diferencia.

Añade retry acotado para un error temporal de base y skip para una fila con campo inválido; registra referencia y causa sin almacenar datos sensibles. Falla una escritura después de un efecto externo y demuestra por qué un envío de email o evento necesita outbox/idempotencia.

**Pista:** simula el efecto externo (marca como "enviado" un email o publica un evento) y luego fuerza que la escritura del chunk falle justo después; al reanudar el job, si el email se reenvía o el evento se publica otra vez, ese es el caso exacto que necesita outbox o una clave de idempotencia en el efecto externo, no solo una transacción de base de datos.

#### Aplica

Diseña un plan para un lote de un millón de filas: chunk size, paginación, restart, deduplicación, archivo de errores y métricas. Como extensión, particiona por rangos disjuntos y programa el job con un scheduler; verifica que dos workers no reclamen el mismo rango.

**Checklist de salida.**

- [ ] Ambos lanzamientos usan la misma instancia lógica, con `inputFile` y `runDate` estables.
- [ ] El primer chunk confirmado no se duplica tras el reinicio.
- [ ] `retry` se limita a `TransientDataAccessException` con `retryLimit(3)`.
- [ ] `skip` se limita a `FlatFileParseException` con `skipLimit(5)` y registra referencia y causa.
- [ ] El listener reporta filas omitidas y filtradas por separado.
- [ ] Un efecto externo usa outbox o clave de idempotencia para no repetirse al reanudar.

**Si falla.** Si el reinicio vuelve a procesar el archivo desde cero, se generó una instancia nueva: reutiliza los mismos `JobParameters` de identificación. Si las filas confirmadas aparecen duplicadas, revisa la clave natural y la deduplicación del writer. Si una pérdida de conectividad se marca como `skip`, clasifícala como `retry`: `skip` es para datos no recuperables. Si el email o el evento se repite al reanudar, el efecto externo necesita outbox o idempotencia.

Entrega test de fallo y reinicio, parámetros exactos, conteos y política documentada de retry/skip para el proyecto integrador de RutaFlow: el lote de liquidación debe poder reanudarse sin duplicar pagos. **Cuándo no usarlo:** no llames `skip` a errores de infraestructura ni configures retry infinito; no ejecutes jobs simultáneos con parámetros que colisionan.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** generar un `run.id` o parámetro distinto en cada reintento pensando que "empezar limpio" es más seguro, cuando en realidad eso crea una nueva instancia de job que vuelve a procesar el archivo desde cero, y marcar con `skip` errores de infraestructura (como una pérdida de conectividad) que en realidad necesitan `retry`, descartando filas que sí eran recuperables.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 3: Particionamiento con múltiples workers y remote chunking · Experto · 1 h 30 min

**Prerrequisito:** Tema 1 de este módulo; `JDK` 27+ y Maven.

**Al terminar podrás:** dividir un step en rangos disjuntos que se ejecutan en paralelo dentro de la misma JVM, verificar que no queden huecos ni duplicados entre particiones, y distinguir ese particionamiento local de un remote chunking que reparte trabajo entre procesos distintos.

#### Aprende

El step de importación de pedidos procesa cien mil filas de forma secuencial y tarda minutos; la máquina tiene varios núcleos libres mientras un solo hilo hace todo el trabajo.

**¿Por qué es importante?** El particionamiento (*partitioning*) divide un step en rangos disjuntos que se ejecutan en paralelo, y verificar la cobertura exacta de esos rangos es lo que distingue un acelerón real de un lote que silenciosamente perdió o repitió registros.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `Partitioner` (interfaz) | Núcleo | `RangoPartitioner.partition(gridSize)` divide 100 ítems en 4 `ExecutionContext` con `inicio`/`fin` disjuntos. |
| Master step con `partitioner(...)` | Núcleo | `StepBuilder.partitioner("workerStep", particionador).step(workerStep).gridSize(4).taskExecutor(...)` lanza los workers. |
| Worker `@StepScope` leyendo su contexto | Núcleo | `@Value("#{stepExecutionContext['inicio']}")` inyecta el rango exacto que `RangoPartitioner` le asignó a esa partición. |
| Verificación sin huecos ni duplicados | Evidencia | Un `Set` compartido entre particiones se compara contra `1..100`; cualquier hueco o repetición rompe el test. |
| Paquetes de Spring Batch 6 reubicados | Error frecuente | `Job`, `Step`, `Partitioner`, `RepeatStatus` y `ExecutionContext` cambiaron de paquete respecto a tutoriales basados en Batch 5. |
| `PlatformTransactionManager` ausente | Fallo deliberado | Con solo `spring-boot-starter-batch` + `h2`, el contexto falla con `NoSuchBeanDefinitionException` al crear `workerStep`. |
| Particionamiento local frente a remote chunking | Decisión | `taskExecutor` reparte hilos dentro de la misma JVM; remote chunking enviaría chunks a workers en otros procesos vía middleware de mensajería. |

Cada fila tiene su explicación individual a continuación.

**`Partitioner` (interfaz) (núcleo).** Un `Partitioner` recibe el `gridSize` solicitado y devuelve un mapa de nombre de partición a `ExecutionContext`, cada uno con los datos que identifican su porción del trabajo. En el laboratorio, `RangoPartitioner.partition(4)` divide 100 ítems en cuatro rangos disjuntos (`inicio`/`fin`) guardados como enteros en cada `ExecutionContext`. La partición no mueve datos: solo describe qué rango le toca a cada worker.

**Master step con `partitioner(...)` (núcleo).** El *master step* no procesa filas: coordina cuántas particiones se crean y con qué `TaskExecutor` se ejecutan. Aquí `StepBuilder("masterStep", jobRepository).partitioner("workerStep", new RangoPartitioner(100)).step(workerStep).gridSize(4).taskExecutor(new SimpleAsyncTaskExecutor()).build()` lanza cuatro ejecuciones del `workerStep`, una por partición, en hilos separados. El `gridSize` debe coincidir con la cantidad de rangos que el `Partitioner` efectivamente produce.

**Worker `@StepScope` leyendo su contexto (núcleo).** Cada ejecución del worker necesita su propio rango, no uno compartido entre hilos. El bean `@StepScope procesadorRango(@Value("#{stepExecutionContext['inicio']}") Integer inicio, @Value("#{stepExecutionContext['fin']}") Integer fin)` se reinstancia por partición y lee exactamente los valores que `RangoPartitioner` puso en su `ExecutionContext`. Sin `@StepScope` todas las particiones compartirían la misma instancia y el mismo rango.

**Verificación sin huecos ni duplicados (evidencia).** Repartir trabajo en paralelo no garantiza por sí solo que la suma de las partes sea el total original. El test acumula en un `Set<Integer>` compartido (`ConcurrentSkipListSet`) todos los enteros que cada worker procesó y lo compara contra `IntStream.rangeClosed(1, 100)`: cualquier hueco (un rango mal calculado) o duplicado (rangos que se superponen) hace fallar la igualdad de conjuntos. Esa comparación exacta es la evidencia de que el particionamiento fue correcto, no una inspección visual del log.

**Paquetes de Spring Batch 6 reubicados (error frecuente).** Spring Boot 4.1.1 resuelve Spring Batch 6.0.5 por su BOM, una versión con una reestructuración de paquetes tan extensa como la que vivió el propio Spring Boot 4. `Job` pasó a `org.springframework.batch.core.job.Job`, `Step` a `org.springframework.batch.core.step.Step`, `Partitioner` a `org.springframework.batch.core.partition.Partitioner` (ya no `.partition.support`), y `RepeatStatus`/`ExecutionContext` se movieron al módulo `spring-batch-infrastructure` bajo `org.springframework.batch.infrastructure.*`. Un tutorial escrito para Batch 5 falla en Batch 6 con `cannot find symbol` en ocho importaciones distintas; la única forma confiable de ubicar el paquete correcto en este sandbox fue inspeccionar directamente el `.jar` resuelto (`unzip -l` sobre el jar cacheado en `~/.m2`), no confiar en la documentación de terceros.

**`PlatformTransactionManager` ausente (fallo deliberado).** Declarar solo `spring-boot-starter-batch` y `h2` compila, pero al arrancar el contexto el `workerStep` falla con `NoSuchBeanDefinitionException: No qualifying bean of type 'org.springframework.transaction.PlatformTransactionManager'`. El `JobRepository` necesita un `DataSource` transaccional, y ese transaction manager solo se auto-configura cuando `spring-boot-starter-jdbc` está presente: el driver H2 por sí solo no basta. Agregar `spring-boot-starter-jdbc` resuelve el fallo sin tocar ninguna clase de negocio.

**Particionamiento local frente a remote chunking (decisión).** El `TaskExecutor` del master step reparte las particiones en hilos de la misma JVM: útil cuando la limitación es CPU/E-S local y no hace falta escalar fuera de un proceso. *Remote chunking* resuelve un problema distinto —escalar entre procesos o máquinas— enviando chunks de datos a workers remotos a través de middleware de mensajería (JMS, RabbitMQ) y recogiendo sus resultados; requiere infraestructura de mensajería externa y manejo explícito de fallos de red, por lo que su demostración completa queda fuera del alcance verificable de este laboratorio y se documenta como decisión arquitectónica, no como código ejecutado.

El particionamiento local reparte un step en rangos disjuntos ejecutados en paralelo dentro de la misma JVM mediante un `Partitioner` y un `TaskExecutor`; cada worker lee su rango vía `@StepScope` y `stepExecutionContext`. Verificar la cobertura exacta —sin huecos ni duplicados— es lo que confirma que la partición fue correcta. El remote chunking persigue el mismo objetivo de paralelismo pero cruzando procesos, a costa de depender de middleware de mensajería.

**Analogía:** particionar un step es como repartir un almacén en pasillos numerados entre varios reponedores: cada uno sabe exactamente qué pasillo le toca (su `ExecutionContext`) y nadie repone el pasillo de otro. Remote chunking es la misma idea pero con reponedores en bodegas distintas, que reciben cajas por camión (la cola de mensajería) en vez de caminar al mismo almacén.

#### Practica

Genera un proyecto Spring Boot desde Initializr con `batch`, `jdbc` y `h2`.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=batch,jdbc,h2 -o particionado.zip && unzip -o particionado.zip -d particionado
```

Crea `RangoPartitioner` que implemente `Partitioner`:

```java
package com.academia.batchpart;

import org.springframework.batch.core.partition.Partitioner;
import org.springframework.batch.infrastructure.item.ExecutionContext;

import java.util.LinkedHashMap;
import java.util.Map;

public class RangoPartitioner implements Partitioner {

    private final int totalItems;

    public RangoPartitioner(int totalItems) {
        this.totalItems = totalItems;
    }

    @Override
    public Map<String, ExecutionContext> partition(int gridSize) {
        Map<String, ExecutionContext> particiones = new LinkedHashMap<>();
        int porParticion = (int) Math.ceil((double) totalItems / gridSize);

        for (int i = 0; i < gridSize; i++) {
            int inicio = i * porParticion + 1;
            int fin = Math.min(inicio + porParticion - 1, totalItems);
            if (inicio > totalItems) break;

            ExecutionContext contexto = new ExecutionContext();
            contexto.putInt("inicio", inicio);
            contexto.putInt("fin", fin);
            particiones.put("particion" + i, contexto);
        }
        return particiones;
    }
}
```

Crea el `Tasklet` del worker, que acumula los ítems procesados en un `Set` estático para poder verificar cobertura después:

```java
package com.academia.batchpart;

import org.springframework.batch.core.step.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.infrastructure.repeat.RepeatStatus;

import java.util.Set;
import java.util.concurrent.ConcurrentSkipListSet;

public class ProcesadorRango implements Tasklet {

    public static final Set<Integer> itemsProcesados = new ConcurrentSkipListSet<>();

    private final int inicio;
    private final int fin;

    public ProcesadorRango(int inicio, int fin) {
        this.inicio = inicio;
        this.fin = fin;
    }

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        for (int i = inicio; i <= fin; i++) {
            itemsProcesados.add(i);
        }
        return RepeatStatus.FINISHED;
    }
}
```

Define el master step y el worker step en `BatchConfig`:

```java
package com.academia.batchpart;

import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class BatchConfig {

    public static final int TOTAL_ITEMS = 100;
    public static final int GRID_SIZE = 4;

    @Bean
    @StepScope
    public ProcesadorRango procesadorRango(@Value("#{stepExecutionContext['inicio']}") Integer inicio,
                                            @Value("#{stepExecutionContext['fin']}") Integer fin) {
        return new ProcesadorRango(inicio, fin);
    }

    @Bean
    public Step workerStep(JobRepository jobRepository, PlatformTransactionManager transactionManager,
                            ProcesadorRango procesadorRango) {
        return new StepBuilder("workerStep", jobRepository)
                .tasklet(procesadorRango, transactionManager)
                .build();
    }

    @Bean
    public Step masterStep(JobRepository jobRepository, Step workerStep) {
        return new StepBuilder("masterStep", jobRepository)
                .partitioner("workerStep", new RangoPartitioner(TOTAL_ITEMS))
                .step(workerStep)
                .gridSize(GRID_SIZE)
                .taskExecutor(new SimpleAsyncTaskExecutor())
                .build();
    }

    @Bean
    public Job particionadoJob(JobRepository jobRepository, Step masterStep) {
        return new JobBuilder("particionadoJob", jobRepository)
                .start(masterStep)
                .build();
    }
}
```

**Primer intento (fallo deliberado):** si solo agregaste `spring-boot-starter-batch` y `h2` al `pom.xml`, `./mvnw test` falla al levantar el contexto con `NoSuchBeanDefinitionException` sobre `PlatformTransactionManager`. Agrega `spring-boot-starter-jdbc` y vuelve a ejecutar.

Escribe el test que lanza el job y verifica cobertura exacta:

```java
package com.academia.batchpart;

import org.junit.jupiter.api.Test;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.test.JobLauncherTestUtils;
import org.springframework.batch.test.context.SpringBatchTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@SpringBatchTest
@Import(BatchConfig.class)
class ParticionadoJobTest {

    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils;

    @Test
    void elJobParticionadoProcesaTodosLosItemsSinHuecosNiDuplicados() throws Exception {
        ProcesadorRango.itemsProcesados.clear();

        JobExecution ejecucion = jobLauncherTestUtils.launchJob(
                new JobParametersBuilder().addLong("run.id", System.nanoTime()).toJobParameters());

        assertThat(ejecucion.getStatus()).isEqualTo(BatchStatus.COMPLETED);
        assertThat(ProcesadorRango.itemsProcesados).hasSize(BatchConfig.TOTAL_ITEMS);
        assertThat(ProcesadorRango.itemsProcesados).isEqualTo(
                IntStream.rangeClosed(1, BatchConfig.TOTAL_ITEMS).boxed().collect(Collectors.toSet()));
    }
}
```

Agrega `spring-batch-test` con `scope=test` al `pom.xml` (sin fijar versión: la resuelve el BOM de Boot) y pon `spring.batch.job.enabled=false` en `application.yml` para que el arranque normal no dispare el job. Ejecuta `./mvnw test`: el log muestra cuatro `workerStep:particionN` ejecutándose en hilos distintos (`cTaskExecutor-1` a `cTaskExecutor-4`) y el job completa con estado `COMPLETED`.

#### Aplica

Sube `TOTAL_ITEMS` a un valor no divisible exactamente entre `GRID_SIZE` (por ejemplo 101 entre 4) y confirma que `RangoPartitioner` sigue cubriendo el rango completo sin que la última partición quede vacía o duplique el límite. Aplica el mismo patrón a la importación de tarifas de RutaFlow: particiona por rango de identificador de tarifa en vez de por rango numérico secuencial.

**Checklist de salida.**

- [ ] `RangoPartitioner.partition(4)` genera cuatro `ExecutionContext` con rangos `inicio`/`fin` disjuntos que cubren `1..TOTAL_ITEMS`.
- [ ] El `masterStep` usa `partitioner("workerStep", ...)`, `gridSize(4)` y un `TaskExecutor`.
- [ ] El worker es `@StepScope` y lee `inicio`/`fin` de `#{stepExecutionContext[...]}`.
- [ ] El test verifica que el conjunto de ítems procesados sea exactamente `1..TOTAL_ITEMS`, sin huecos ni duplicados.
- [ ] `spring-boot-starter-jdbc` está presente; sin él, el contexto falla por `PlatformTransactionManager` ausente.
- [ ] Puedes explicar en una frase por qué remote chunking no sustituye al particionamiento local cuando el cuello de botella es CPU de una sola máquina.

**Si falla.** Si el contexto no arranca con `NoSuchBeanDefinitionException` sobre `PlatformTransactionManager`, falta `spring-boot-starter-jdbc`. Si compila pero las importaciones de `Job`, `Step`, `Partitioner`, `RepeatStatus` o `ExecutionContext` fallan con `cannot find symbol`, estás usando los paquetes de Spring Batch 5: revisa las rutas de este tema, que corresponden a Batch 6. Si el test falla porque el conjunto de ítems procesados tiene menos elementos que `TOTAL_ITEMS`, algún rango del `Partitioner` quedó mal calculado (huecos); si tiene el tamaño correcto pero la igualdad de conjuntos falla, dos particiones se solaparon (duplicados).

Entrega el job particionado, el test de cobertura exacta y una nota de una frase sobre cuándo usarías remote chunking en vez de particionamiento local, como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no particiones un step que ya es rápido de sobra en secuencial, ni particiones por un campo que no permite calcular rangos disjuntos de forma barata.

Como **siguiente** paso, lleva lo aprendido al próximo módulo y conéctalo con el proyecto integrador del track.

**Errores comunes:** omitir `spring-boot-starter-jdbc` y asumir que el error de `PlatformTransactionManager` es un problema del código de negocio, cuando es una dependencia faltante; y copiar importaciones de Spring Batch 5 (`org.springframework.batch.core.Job`, `org.springframework.batch.repeat.RepeatStatus`) que no existen en la versión 6 que resuelve Spring Boot 4.1.1.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
