# Laboratorio Spring Kafka de RutaFlow

Este proyecto demuestra publicación JSON con `KafkaTemplate`, `envioId` como key, dos consumer groups, retries y DLT, y la secuencia outbox/inbox con Spring JDBC. La suite inicia Kafka embebido y usa H2 en memoria; los pasos de prueba no requieren Docker.

## Requisitos y ejecución

- JDK 25 (`java -version`)
- Maven Wrapper incluido (`./mvnw`)

Desde esta carpeta:

```bash
./mvnw test
```

Las nueve pruebas confirman tópico, partición, offset, key y orden; recepción en ambos consumer groups; tres intentos antes del DLT con key, partición y contenido preservados; rollback conjunto de envío/outbox; deduplicación inbox; replay después de fallar la marca SQL posterior al ACK; y una transacción Kafka abortada que solo ve el consumidor `read_uncommitted`.

Para ejecutar la app manualmente con PostgreSQL y Kafka locales, levanta ambos servicios con `docker compose up -d` o `podman compose up -d`. La aplicación usa PostgreSQL en `localhost:15432` y Kafka en `localhost:19092`; arráncala con `./mvnw spring-boot:run`.

## Alcance

Las pruebas comprueban la transacción SQL, la deduplicación y replay junto al broker embebido. H2 hace rápida la suite; antes de producción, repite migraciones y concurrencia contra PostgreSQL real y prueba la caída real del proceso en cada ventana de outbox. El dispatcher didáctico no reclama filas con lease y no debe ejecutarse con varias instancias.

La prueba usa `@DirtiesContext` para cerrar el contexto Spring antes de apagar el broker embebido. La suite de nueve pruebas ya no registra el error de `KafkaStorageException` al borrar el directorio temporal; aún aparece un `WARN` interno de Kafka 4.2.2 al cerrar un cliente que ya estaba cerrado. El consumidor de verificación usa `KafkaTestUtils.consumerProps(broker, group, false)`, la sobrecarga vigente de Spring Kafka 4.0.
