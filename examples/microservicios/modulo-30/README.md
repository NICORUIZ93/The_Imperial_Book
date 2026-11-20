# Laboratorio · Módulo 26 · Mensajería avanzada y event-driven (modulo-30)

Lección: [`web/public/content/microservices/modulo-30.md`](../../../web/public/content/microservices/modulo-30.md) ·
fichas F157–F160 · Fase 3 (Experto).

**Versiones:** Node.js 26.13.1 LTS · kafkajs 2.2.4 · @kafkajs/confluent-schema-registry 4.1.0 · avsc 5.7.9 ·
amqplib 2.4.0 · @nats-io/transport-node, jetstream y kv 3.5.0 · Apache Kafka 4.4.0 · Confluent Schema Registry 8.4.1 ·
RabbitMQ 4.4.1 · NATS Server 2.15.3. `package-lock.json` fija el árbol completo.

```bash
cd examples/microservicios/modulo-30
npm ci
docker compose up -d --wait     # Kafka :9092 · Schema Registry :8081 · RabbitMQ :5672/15672 · NATS :4222/8222
./verificar.sh --compose        # tests, demos y errores comunes de las 4 fichas → «RESULTADO: OK»
docker compose down -v
```

Sin `--compose`, `./verificar.sh` ejecuta F157 (la parte Avro) y F160, y F158 y F159 si RabbitMQ y NATS responden en
`localhost`; lo de Kafka y Schema Registry se omite avisando. Direcciones en `comun/config.js` (`KAFKA_BROKERS`,
`SCHEMA_REGISTRY_URL`, `AMQP_URL`, `NATS_URL`).

| Carpeta | Ficha | Qué hay |
|---|---|---|
| `f157-kafka-schema/` | F157 Kafka profundo: transacciones, EOS, Schema Registry | `esquemas.js` (versiones Avro y reglas BACKWARD/FORWARD/FULL), `formato.js` (formato de cable de Confluent), `transacciones.js` (dos topics atómicos y fencing), `schema.test.js`, `registry.infra.js`, `error-comun.js` (campo sin default) |
| `f158-rabbitmq/` | F158 RabbitMQ avanzado | `topologia.js` (cola quorum con `x-delivery-limit`, colas de espera con TTL, DLQ), `consumidor.js` (reintento escalonado), `demo.js`, `rabbitmq.test.js` (incluye single active consumer), `error-comun.js` (requeue infinito) |
| `f159-nats/` | F159 NATS | `jetstream.js` (deduplicación por `msgID`, cola de trabajo con `max_deliver`, KV con compare-and-set), `demo.js`, `nats.test.js`, `error-comun.js` (publish sin `msgID`) |
| `f160-ecst/` | F160 Event Notification vs Event-Carried State Transfer | `servicios.js` (catálogo HTTP y dos consumidores), `demo.js`, `ecst.test.js`, `error-comun.js` (réplica sin versión) |

**Verificado en el entorno de autoría** (Node 26.13.1, RabbitMQ 3.12.1 y NATS Server 2.10.7 locales): F157 sin Kafka,
F158, F159 y F160. Pendiente en el Mac (ver `verificacion/microservicios/pendiente.md`): `--compose` completo con las
imágenes fijadas (RabbitMQ 4.4.1, NATS 2.15.3), Schema Registry y las transacciones de Kafka.
