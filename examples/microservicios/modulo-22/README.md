# Laboratorio · Módulo 18 · Comunicación

Lección: [`web/public/content/microservices/modulo-22.md`](../../../web/public/content/microservices/modulo-22.md)
(Fase 2, fichas F113–F118, specs/018). Un solo `package.json` con lockfile para las seis fichas; todo es JavaScript
con módulos ES que Node ejecuta tal cual.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f113-rest` | REST con Axios/Fetch | `servicio-inventario.js` (:3113), `cliente-fetch.js`, `cliente-axios.js`, `main.js`, `error-comun.js` | `clientes.test.js` (10) |
| `f114-grpc` | gRPC con @grpc/grpc-js | `inventario.proto`, `servidor.js` (:50114), `cliente.js` | `inventario.test.js` (6) |
| `f115-graphql` | GraphQL con Apollo Server | `main.js` (:4115), `esquema.js`, `n-mas-1.js` | `esquema.test.js` (7) |
| `f116-kafka-rabbit` | KafkaJS, amqplib | `kafka-productor.js`, `kafka-consumidor.js`, `rabbit-publicador.js`, `rabbit-consumidor.js`, `error-comun.js` | `evento.test.js` (4); con brokers: `kafka.infra.js` (2) y `rabbit.infra.js` (3) |
| `f117-nats` | NATS | `nats.js`, `demo.js` | con broker: `nats.infra.js` (6) |
| `f118-sync-async` | Sync vs async | `servicios.js`, `comparar.js` | `comparar.test.js` (5) |

## Versiones

Node.js **26.13.1 LTS** · axios **1.21.1** · @grpc/grpc-js **1.14.7** · @grpc/proto-loader **0.8.1** · @apollo/server
**5.5.2** · graphql **16.15.0** · dataloader **2.2.3** · kafkajs **2.2.4** (sin publicaciones desde 2023-02-27; la
alternativa mantenida es `@confluentinc/kafka-javascript` 1.11.0, ver la ficha) · amqplib **2.4.0** ·
@nats-io/transport-node **3.5.0**. Brokers: Apache Kafka **4.4.0** (KRaft), RabbitMQ **4.4.1** y NATS Server
**2.15.3** (Docker Compose v5.6.1 o posterior).

## Ejecutar

```bash
cd examples/microservicios/modulo-22
npm ci
node f113-rest/servicio-inventario.js        # y en otra terminal: node f113-rest/main.js
node f114-grpc/servidor.js                   # y: node f114-grpc/cliente.js
node f115-graphql/main.js                    # http://127.0.0.1:4115/
node f118-sync-async/comparar.js
docker compose up -d --wait                  # Kafka :9092 · RabbitMQ :5672 (consola :15672, academia/academia) · NATS :4222
node f116-kafka-rabbit/rabbit-consumidor.js  # y: node f116-kafka-rabbit/rabbit-publicador.js
node f116-kafka-rabbit/kafka-productor.js && node f116-kafka-rabbit/kafka-consumidor.js
node f117-nats/demo.js
docker compose down -v
```

Variables para usar otros brokers: `KAFKA_BROKERS` (por defecto `localhost:9092`), `AMQP_URL`
(`amqp://academia:academia@localhost:5672`) y `NATS_URL` (`nats://localhost:4222`).

## Verificar

```bash
./verificar.sh             # sin Docker: npm ci, 32 tests y demos de F113, F114, F115 y F118
./verificar.sh --compose   # además levanta los tres brokers y ejecuta tests y demos de F116 y F117
./verificar.sh --externo   # igual, con brokers ya arrancados; omite (avisando) los que no respondan
```

Requiere Node.js 26.13.1, npm y `curl` (y Docker para `--compose`). Toda la salida queda también en
`logs/verificar.log` y la de cada programa en `logs/<ficha>-*.log`; con `--compose`, los logs de los contenedores en
`logs/compose.log`. Resultado esperado: `ℹ tests 32 · ℹ pass 32` (más 2, 3 y 6 tests con brokers), un `✔` por
comprobación y `RESULTADO: OK · Módulo 18 (Comunicación) verificado`. Si algo falla, sigue con lo demás, lista todos
los fallos al final y termina con `RESULTADO: FALLA` y código 1.
