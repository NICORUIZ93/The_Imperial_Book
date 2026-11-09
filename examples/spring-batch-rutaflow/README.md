# Spring Batch · importación pequeña de RutaFlow

Laboratorio de Spring Boot 4.1.2 y Spring Batch 6.0.6. Importa tres filas CSV,
filtra una tarifa de cero, guarda dos filas en H2 y ejecuta un Tasklet de resumen.

## Ejecutar

```bash
./mvnw -q clean test
```

La prueba lanza el Job al iniciar el contexto y comprueba las referencias e
importes persistidos. Debe quedar `RF-1001` y `RF-1003`; no `RF-1002`. El log
muestra `Pedidos importados: 2`.

Para ver la ejecución completa:

```bash
./mvnw spring-boot:run
```

## Seguir el recorrido

- `src/main/resources/pedidos.csv`: entrada del ejemplo.
- `ImportJobConfig`: reader, processor, writer, Step por chunks, Tasklet y Job.
- `ImportJobTest`: evidencia de los datos finales.

`chunk(2)` es un valor didáctico, no una recomendación universal. La base en
memoria y la única prueba no demuestran reinicio, volumen de producción,
particionamiento ni escritura idempotente; se cubren por separado.
