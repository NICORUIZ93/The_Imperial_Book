# Micrometer Tracing: una solicitud, dos servicios

Ejemplo ejecutable con Spring Boot 4.1.2, Micrometer Tracing, OpenTelemetry y
Jaeger. Entregas llama por HTTP a Inventario con el `RestClient.Builder`
autoconfigurado; el script busca una traza exportada que contenga ambos servicios.

## Requisitos

- JDK 25
- Docker Compose o Podman Compose
- `curl` y Python 3

## Prueba completa

Desde esta carpeta ejecuta:

```bash
./scripts/verify-trace.sh
```

El script crea el paquete, inicia Jaeger y dos procesos de la aplicación, llama a
`GET /deliveries/RF-314` y consulta la API de Jaeger. La salida incluye el mismo
trace ID y los nombres `entregas` e `inventario` en una traza. Al finalizar,
detiene las aplicaciones y el contenedor. También quedan logs locales en
`/tmp/rutaflow-tracing-entregas.log` y `/tmp/rutaflow-tracing-inventario.log`.

Para ver el diagrama de spans, inicia el backend con `docker compose up -d`, ejecuta
`./mvnw -q package`, y levanta cada proceso en una terminal:

```bash
java -jar target/spring-tracing-rutaflow-0.1.0.jar --spring.application.name=entregas --rutaflow.role=delivery --server.port=8081 --rutaflow.inventory-url=http://localhost:8082
```

```bash
java -jar target/spring-tracing-rutaflow-0.1.0.jar --spring.application.name=inventario --rutaflow.role=inventory --server.port=8082 --rutaflow.inventory-url=http://localhost:8082
```

Llama a Entregas y abre Jaeger en `http://localhost:16686`:

```bash
curl -s http://localhost:8081/deliveries/RF-314
```

La respuesta esperada es `{"pedido":"RF-314","estado":"en ruta","inventario":"Inventario reservado para RF-314"}`.

## Código y límites

- `DeliveryController` construye el cliente desde `RestClient.Builder` y crea la
  observación `rutaflow.delivery.prepare` con una etiqueta de baja cardinalidad.
- `InventoryController` recibe la llamada HTTP propagada por el contexto de trace.
- `application.yml` fija sampling al 100% solo para que cada petición de esta demo
  aparezca. No copies esa tasa a producción sin estimar volumen y costo.
- Jaeger usa almacenamiento en memoria: pierde las trazas al reiniciarse y sirve
  como backend local de aprendizaje, no como almacén productivo.

Los spans miden trabajo; el `traceId` los agrupa. No pongas `pedidoId`, usuario,
correo u otros valores únicos como etiquetas de métricas: crean demasiadas series y
pueden exponer datos personales. En producción, decide qué atributos pueden
exportarse y protege acceso al backend.
