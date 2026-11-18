# Spring Batch · importación pequeña de RutaFlow

Laboratorio de Spring Boot 4.1.2 y Spring Batch 6.0.6. Importa cuatro filas CSV,
filtra una tarifa de cero, registra una fila mal formada, reintenta un fallo
transitorio, guarda dos filas en H2 y ejecuta un Tasklet de resumen.

## Ejecutar

```bash
./mvnw -q clean test
```

La prueba lanza el Job al iniciar el contexto y comprueba las referencias e
importes persistidos. Deben quedar `RF-1001` y `RF-1003`; `RF-1002` se filtra y
la fila mal formada genera una causa en `batch_rechazo`. El log muestra
`Pedidos importados: 2`.

Para ver la ejecución completa:

```bash
./mvnw spring-boot:run
```

## Seguir el recorrido

- `src/main/resources/pedidos.csv`: entrada del ejemplo.
- `ImportJobConfig`: reader, processor, writer, Step por chunks, Tasklet y Job.
- `ImportJobTest`: datos, retry y fila rechazada.
- `RestartJobTest`: fallo preparado, reanudación con los mismos parámetros y
  nueva instancia con otro identificador.

`chunk(2)` es un valor didáctico, no una recomendación universal. La base es H2
en memoria; el fixture usa `MERGE` por clave para demostrar idempotencia. Las
pruebas no miden volumen de producción ni particionamiento.

## Alternativa Gradle

Desde esta misma carpeta, con JDK 25:

```bash
./gradlew clean classes test
```

Usa las mismas fuentes y pruebas del laboratorio. Consulta la [guía del curso](../../docs/SPRING-BOOT-GRADLE.md)
para perfiles, filtros de tests, procesadores y tareas especiales. Los resultados
JUnit de Gradle están en `build/test-results/`; una compilación sin tests no
acredita el escenario de integración. Los scripts que llaman a `mvnw` siguen
usando Maven y su carpeta `target/`.
