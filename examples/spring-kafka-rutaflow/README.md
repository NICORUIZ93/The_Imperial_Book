# Laboratorio Spring Kafka de RutaFlow

Este proyecto demuestra publicación JSON con `KafkaTemplate`, `envioId` como key, dos consumer groups, retries y DLT, y la secuencia outbox/inbox con Spring JDBC. La suite inicia Kafka embebido y usa H2 en memoria; los pasos de prueba no requieren Docker.

## Requisitos y ejecución

- JDK 25 (`java -version`)
- Maven Wrapper incluido (`./mvnw`)

Desde esta carpeta:

```bash
./mvnw test
```

Las ocho pruebas confirman tópico, partición, offset, key, orden para un mismo envío, recepción en ambos grupos, tres intentos antes de `rutaflow.envio.creado-dlt`, rollback de envío/outbox, transacción inbox, confirmación del dispatcher y replay sin doble efecto.

Para ejecutar la app manualmente con PostgreSQL y Kafka locales, levanta ambos servicios con `docker compose up -d` o `podman compose up -d`. La aplicación usa PostgreSQL en `localhost:15432` y Kafka en `localhost:19092`; arráncala con `./mvnw spring-boot:run`.

## Alcance

Las pruebas comprueban la transacción SQL, la deduplicación y replay junto al broker embebido. H2 hace rápida la suite; antes de producción, repite migraciones y concurrencia contra PostgreSQL real y prueba la caída real del proceso en cada ventana de outbox. El dispatcher didáctico no reclama filas con lease y no debe ejecutarse con varias instancias.

En este entorno la prueba termina con código 0, aunque Kafka 4.2.2 advierte que el directorio de logs temporal queda fuera de línea durante el cierre del broker embebido. El recorrido de mensajes sí fue comprobado; el cierre limpio del broker queda pendiente de corregir.
