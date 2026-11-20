# Laboratorio · Módulo 25 · Consistencia distribuida (modulo-29)

Lección: [`web/public/content/microservices/modulo-29.md`](../../../web/public/content/microservices/modulo-29.md) ·
fichas F152–F156 · Fase 3 (Experto).

**Versiones:** Node.js 26.13.1 LTS · pg 8.23.1 · kafkajs 2.2.4 · @temporalio/client, worker, workflow, activity y
testing 1.26.0 · PostgreSQL 18.7 · Apache Kafka 4.4.0 · Debezium 3.7 (Kafka Connect, imagen `quay.io/debezium/connect:3.7`).
`package-lock.json` fija el árbol completo.

```bash
cd examples/microservicios/modulo-29
npm ci
docker compose up -d --wait     # PostgreSQL :5432 · Kafka :9092 · Kafka Connect + Debezium :8083
./verificar.sh --compose        # tests, demos y errores comunes de las 5 fichas → «RESULTADO: OK»
docker compose down -v
```

Sin `--compose`, `./verificar.sh` ejecuta lo que no necesita infraestructura y lo de PostgreSQL si responde en
`localhost:5432`; lo de Kafka, Debezium y Temporal se omite avisando. Cambia direcciones con `PG_URL`,
`KAFKA_BROKERS`, `CONNECT_URL` y `TEMPORAL_ADDRESS` (ver `comun/config.js`).

| Carpeta | Ficha | Qué hay |
|---|---|---|
| `f152-outbox/` | F152 Outbox Pattern + CDC con Debezium | `outbox.js` (pedido + evento en una transacción, relay con `SKIP LOCKED`), `cdc-wal.js` (el WAL decodificado que lee Debezium), `debezium/conector-outbox.json`, `outbox.test.js`, `debezium.infra.js`, `error-comun.js` (dual write) |
| `f153-temporal/` | F153 Sagas orquestadas con Temporal.io | `workflows.js`, `actividades.js`, `saga.js` (pila de compensaciones), `worker.js`, `iniciar.js`, `saga.test.js`, `temporal.infra.js`, `error-comun.js` + `workflow-mal.js` (E/S en el workflow) |
| `f154-idempotencia/` | F154 Idempotencia real en consumidores Kafka | `idempotencia.js` (marca + efecto en una transacción), `consumidor-kafka.js`, `demo.js`, `idempotencia.test.js`, `error-comun.js` (deduplicar por offset) |
| `f155-exactly-once/` | F155 Exactly-once semantics en la práctica | `eos-kafka.js` (transacciones de Kafka y `read_committed`), `offsets-en-bd.js` (offset y resultado en la misma transacción), `exactly-once.test.js`, `error-comun.js` (efecto externo duplicado) |
| `f156-2pc/` | F156 Two-Phase Commit: por qué no usar | `coordinador.js` (`PREPARE TRANSACTION` / `COMMIT PREPARED`), `demo.js` (coordinador caído y fila bloqueada), `dospc.test.js`, `error-comun.js` |

**Temporal:** `temporal.infra.js` usa `TestWorkflowEnvironment.createLocal()`, que descarga el servidor de desarrollo
del CLI de Temporal la primera vez (necesita internet). Para un servidor propio: `TEMPORAL_ADDRESS=localhost:7233`.
Para jugar a mano: `temporal server start-dev` en una terminal, `node f153-temporal/worker.js` en otra y
`node f153-temporal/iniciar.js P-1 inestable "Calle 1"` en una tercera (la UI queda en http://localhost:8233).

**Verificado en el entorno de autoría** (Node 26.13.1, PostgreSQL 16.15 local con `wal_level=logical` y
`max_prepared_transactions=10`): todo lo de PostgreSQL, la saga sin servidor y el empaquetado de workflows.
Pendiente en el Mac (ver `verificacion/microservicios/pendiente.md`): `--compose` completo (PostgreSQL 18.7, Kafka,
Debezium) y los tests con servidor Temporal.
