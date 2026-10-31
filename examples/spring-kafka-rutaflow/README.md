# Laboratorio: Spring Boot + Kafka + RutaFlow

Este laboratorio ejecuta un flujo local de envíos:

1. `POST /envios` guarda el envío y el evento en una transacción PostgreSQL.
2. Un dispatcher reclama filas del outbox y publica `EnvioCreado` usando `envioId` como key.
3. Un consumer group procesa el evento y guarda inbox + proyección en una transacción SQL.
4. El mismo `eventId` no aplica el efecto dos veces; los errores permanentes van a una DLT.

El ejemplo demuestra entrega **al menos una vez**, recuperación y duplicados seguros. No
implementa ni promete una transacción atómica entre PostgreSQL y Kafka. El broker de un nodo
y las credenciales locales son exclusivamente para aprendizaje.

## Requisitos

- JDK 25 o posterior y Maven 3.9 o posterior.
- Docker Compose v2 (o Podman Compose).
- Puertos locales libres `5432`, `8080` y `19092`.

## Ejecutar las pruebas

Desde esta carpeta:

```bash
mvn test
```

Las pruebas usan Kafka embebido y H2 en modo PostgreSQL; no necesitan Docker. Verifican rollback
conjunto, publicación/key, proyección idempotente, retry de un fallo transitorio y envío de un
evento inválido a la DLT, conservación de bytes malformados, rollback del inbox y recuperación
de una publicación fallida simulada. No equivalen a una prueba de clúster Kafka ni sustituyen ejecutar el
stack PostgreSQL real.

## Ejecutar el flujo manual

En una terminal, desde esta carpeta:

```bash
docker compose up -d --wait
mvn spring-boot:run
```

En otra terminal, crea un envío:

```bash
curl -i -X POST http://localhost:8080/envios \
  -H 'Content-Type: application/json' \
  -d '{"referencia":"RF-0001"}'
```

La respuesta es `202 Accepted` con `envioId` y `eventId`. Copia el `envioId` y consulta la
proyección:

```bash
curl http://localhost:8080/envios/PEGA_AQUI_EL_ENVIO_ID/ruta
```

Reemplaza `PEGA_AQUI_EL_ENVIO_ID` por el UUID de la respuesta anterior. La consulta puede dar
`404` hasta que el consumidor procese el evento; después debe incluir el estado `RECIBIDO`. En los
logs de la app observa la misma key, partición y offset que recibió `rutaflow-ruteo`. Un `POST`
con referencia vacía debe responder `400`; un evento inválido se recupera en
`rutaflow.envio.creado.DLT`.

Para comprobar tópicos desde el contenedor Kafka:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 --list
```

## Fallos que deben poder explicarse

- Si el broker no está disponible, el envío y su fila outbox se confirman juntos en PostgreSQL;
  el dispatcher vuelve a intentarlo con backoff.
- Si el broker acepta el evento y la app cae antes de marcar `published_at`, puede publicarse
  otra vez. El inbox evita repetir el efecto, no evita el duplicado en Kafka.
- Si falla la actualización de la proyección, la transacción SQL revierte también la fila inbox;
  al reentregarse el evento puede procesarse de nuevo.
- Un evento inválido no mejora con reintentos: se envía a DLT para inspección y replay controlado.
- `enable.idempotence` protege retransmisiones del productor dentro de Kafka; no coordina el
  commit del broker con una transacción PostgreSQL.

## Fuera del alcance

El dispatcher está pensado para una sola instancia. El lease de 30 segundos no se renueva
durante un lote de 20 publicaciones y no usa token de propietario; no se ha demostrado
exclusión ni orden de publicación con varias instancias.

No es una configuración de producción: un broker y una réplica no toleran la pérdida del nodo;
las credenciales son de laboratorio; no se incluyen TLS/SASL, evolución con Schema Registry,
retención/replay operativo ni métricas/alertas. El `schema.sql` inicializa el laboratorio vacío;
un servicio real debe usar migraciones gestionadas y una política de seguridad y operación.

## Fuentes primarias

- [Spring Boot: Apache Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html)
- [Spring for Apache Kafka: serialización JSON](https://docs.spring.io/spring-kafka/reference/kafka/serdes.html)
- [Spring for Apache Kafka: manejo de errores](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html)
- [Apache Kafka: conceptos y términos](https://kafka.apache.org/documentation/#intro_concepts_and_terms)

El alcance ejecutado y sus límites están en [VERIFICATION.md](VERIFICATION.md).
