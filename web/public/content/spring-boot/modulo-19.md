# Módulo 19: Spring Batch — jobs, chunks y procesamiento masivo

## Aprende construyendo

Construirás un job que importa pedidos desde CSV, valida y transforma cada fila, y persiste resultados por lotes. Después ensayarás reinicio y políticas de error con datos deliberadamente inválidos. El objetivo es procesamiento reanudable, observable y acotado en memoria.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** importa tres filas CSV con chunk de dos; una fila inválida se registra y la escritura del chunk falla o confirma completa.
- **Caso RutaFlow:** reconcilia cientos de miles de tarifas con archivo identificado por checksum y `JobParameters` estables. Guarda rechazados para conciliación, registra leídos/escritos/omitidos, y reinicia la misma instancia tras una caída sin duplicar registros por la clave natural.

Compara los límites de transacción y el consumo de memoria con más de un chunk. No confundas `skip` con una salida silenciosa: cada fila excluida necesita causa y evidencia.

### Tema 1: Job, Step, Tasklet y chunk processing

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir un `Job`, un `Step`, un `Tasklet` y un step orientado a chunks, y ejecutar un job reproducible. Genera un proyecto Spring Boot desde Initializr con `batch`, `jdbc` y `h2`; JDK 25+ y Maven.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Cada noche se importa un archivo de pedidos. Cargarlo completo en una lista puede agotar memoria; detenerse al primer error obliga a rehacer manualmente el lote entero.

**¿Por qué es importante?** Un procesamiento por chunks acota memoria y hace que el punto de confirmación pueda observarse y recuperarse.

#### Paso 3 · Teoría y modelo mental

Un `Job` coordina la ejecución; sus `Step`s separan fases. Un `Tasklet` sirve para una tarea acotada (por ejemplo, marcar inicio de importación). El modelo chunk lee elementos, los procesa y escribe un bloque dentro de límites transaccionales: cada chunk confirmado queda persistido.

`ItemReader` obtiene registros; `ItemProcessor` transforma o filtra; `ItemWriter` escribe un chunk. `JobRepository` mantiene metadatos de instancias y ejecuciones. `JobParameters` identifican una ejecución lógica y deben incluir parámetros estables como fecha de archivo, no una hora aleatoria que impida reanudar.
**Analogía:** un `Job` es la receta completa de un menú; cada `Step` es un plato de esa receta. Un `Tasklet` es un paso que se hace de una sola vez (encender el horno); el *chunk processing* es una cadena de montaje que toma ingredientes de a lotes, los cocina y los emplata en grupos, en vez de uno por uno.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/main/java/academia/batch/ImportJobConfig.java` dentro.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
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
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
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

#### Construye el writer y el step

Para este primer laboratorio, `JdbcPedidoWriter` implementa `ItemWriter<PedidoImportado>` y recorre el `Chunk<? extends PedidoImportado>` llamando a `JdbcTemplate.update("insert into pedido_importado(referencia, importe) values (?, ?)", pedido.referencia(), pedido.importe())`. El step ejecuta el writer dentro de la transacción del chunk, así que el tamaño del chunk define el grupo de escrituras que se confirma junto.

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

#### Paso 5 · Práctica guiada

Implementa dos steps: validar archivo y luego importar. Compara `Tasklet` para registrar el resumen final con un step chunk para procesar cada fila. Añade un reader JDBC paginado (`JdbcPagingItemReader`) para leer desde una tabla sin materializar todos los resultados.
**Pista:** aplica un cambio cada vez y vuelve a ejecutar; si algo se rompe, el último cambio es el sospechoso.
#### Paso 6 · Práctica independiente

Construye importación de tarifas de RutaFlow con `FlatFileItemReader`, processor que normalice códigos y writer persistente con `JdbcBatchItemWriter`. Agrega conteos leídos, filtrados, escritos y fallidos. Verifica que la memoria usada no crece linealmente con el total de filas.

#### Paso 7 · Cierre y evidencia

Entrega job, archivo fixture, test del step y conteos del lote como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no elijas Batch para una petición HTTP inmediata y pequeña; una cola/eventos o una operación síncrona pueden ser más apropiadas. **Evidencia:** tests con más de un chunk y SQL o logs que demuestren límites transaccionales.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** dar por hecho que el código funcionó sin leer la salida real, y copiar el ejemplo sin entender qué hace cada línea.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
**Evidencia de aprendizaje:** entrega la salida del Paso 4, el fallo diagnosticado en el Paso 5 y una explicación breve de la corrección.
### Tema 2: Reinicio, JobParameters, retry, skip y listeners

#### Paso 1 · Objetivo y preparación

Al finalizar podrás reanudar un job fallido desde su estado guardado, distinguir errores recuperables de registros inválidos y auditar el resultado del lote.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

El job procesó 80 000 filas cuando el sistema perdió conectividad. Reiniciar desde cero puede duplicar efectos; saltar silenciosamente cualquier error hace que la conciliación sea imposible.

**¿Por qué es importante?** Un lote reanudable evita repetir todo el trabajo y permite conciliar resultados cuando un proceso falla a mitad de camino.

#### Paso 3 · Teoría y modelo mental

Una instancia de job se identifica por nombre y parámetros de identificación; sus ejecuciones registran estado y contexto. La reanudación requiere que reader/writer y efectos externos sean compatibles con reinicio. `skip` aplica a datos no recuperables dentro de un límite y debe registrar la fila; `retry` aplica a fallos transitorios con límite/backoff. No clasifiques toda excepción como retryable.

El listener observa inicio/fin para métricas, pero no reemplaza transacciones ni manejo de errores. Un efecto externo debe tener idempotencia para no duplicarse si el job reinicia después de enviarlo.
**Analogía:** reiniciar un batch es como retomar una serie donde la dejaste, no desde el capítulo uno: los `JobParameters` son el marcador que recuerda dónde ibas. `retry` es volver a intentar una escena que salió mal; `skip` es saltarse un fotograma dañado para no frenar toda la reproducción; y los `listeners` son las notas al margen que registran qué pasó en cada tramo.
#### Paso 4 · Demostración guiada
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
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


Ejecuta el job con `JobParameters` que incluyan `inputFile=pedidos.csv` y `runDate=2026-10-13`; configura el test para forzar una falla tras el primer chunk y volver a lanzar **la misma instancia lógica**. Ejecuta `./mvnw test -Dtest=ImportJobRestartTest`.

**Resultado esperado:** el primer chunk confirmado no se duplica, el job completa al reanudarse y el listener reporta filas omitidas explícitamente. **Fallo deliberado:** genera un `run.id` nuevo para el segundo intento; observarás una nueva instancia que vuelve a iniciar el archivo. Compara con el reinicio de la misma instancia y explica la diferencia.

#### Paso 5 · Práctica guiada

Añade retry acotado para un error temporal de base y skip para una fila con campo inválido; registra referencia y causa sin almacenar datos sensibles. Falla una escritura después de un efecto externo y demuestra por qué un envío de email o evento necesita outbox/idempotencia.
**Pista:** aplica un cambio cada vez y vuelve a ejecutar; si algo se rompe, el último cambio es el sospechoso.
#### Paso 6 · Práctica independiente

Diseña un plan para un lote de un millón de filas: chunk size, paginación, restart, deduplicación, archivo de errores y métricas. Como extensión, particiona por rangos disjuntos y programa el job con un scheduler; verifica que dos workers no reclamen el mismo rango.

#### Paso 7 · Cierre y evidencia

Entrega test de fallo y reinicio, parámetros exactos, conteos y política documentada de retry/skip para el proyecto integrador de RutaFlow: el lote de liquidación debe poder reanudarse sin duplicar pagos. **Cuándo no usarlo:** no llames `skip` a errores de infraestructura ni configures retry infinito; no ejecutes jobs simultáneos con parámetros que colisionan. **Evidencia:** log del primer fallo, reanudación y resultado final conciliado. Referencia: [Spring Batch Reference](https://docs.spring.io/spring-batch/reference/).
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** dar por hecho que el código funcionó sin leer la salida real, y copiar el ejemplo sin entender qué hace cada línea.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
