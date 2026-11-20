# Laboratorio · Módulo 21 · Observabilidad (Node.js)

Lección: [`web/public/content/microservices/modulo-25.md`](../../../web/public/content/microservices/modulo-25.md)
(Fase 2, fichas F130–F134, specs/018). Un solo `package.json` con lockfile para las cinco fichas; todo es JavaScript
(módulos ES) que Node 26 ejecuta tal cual.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f130-opentelemetry` | OpenTelemetry para Node | `telemetria.js` (arranque del SDK con `--import`), `pedidos.js` (:3130) → `inventario.js` (:3131), `exportador-resumen.js`, `error-comun.js` | `traza.test.js` (2) |
| `f131-traceparent` | Propagación de traceparent en AMQP/Kafka | `propagacion.js`, `productor-rabbit.js` / `consumidor-rabbit.js`, `productor-kafka.js` / `consumidor-kafka.js`, `trazas.js`, `error-comun.js` | `propagacion.test.js` (5) y `broker.infra.js` (1 por broker) |
| `f132-pino-winston` | Pino/Winston | `logger-pino.js`, `logger-winston.js`, `correlacion.js`, `demo.js`, `error-comun.js` | `loggers.test.js` (5) |
| `f133-loki` | ELK o Grafana Loki | `envio-loki.js` (Pino → `POST /loki/api/v1/push`), `demo.js`, `loki-falso.js`, `error-comun.js` | `loki.test.js` (3) |
| `f134-prometheus` | Prometheus client | `metricas.js` (RED), `servidor.js` (:9464 `/metrics`), `error-comun.js` | `metricas.test.js` (4) |

`comun/config.js` tiene las direcciones de la infraestructura (`AMQP_URL`, `KAFKA_BROKERS`, `LOKI_URL`,
`OTEL_EXPORTER_OTLP_ENDPOINT`) y `comun/procesos.js` arranca programas en segundo plano para los tests.
`prometheus/prometheus.yml` raspa `host.docker.internal:9464` y `grafana/provisioning` deja configuradas las fuentes
Loki, Prometheus y Jaeger (con enlace de `trace_id` en los logs a la traza).

## Versiones

Node.js **26.13.1 LTS** · @opentelemetry/api **1.10.0** · @opentelemetry/sdk-node **0.301.2** ·
@opentelemetry/sdk-trace **3.1.1** · @opentelemetry/auto-instrumentations-node **0.83.1** ·
@opentelemetry/exporter-trace-otlp-http **0.301.2** · import-in-the-middle **3.6.0** · amqplib **2.4.0** ·
kafkajs **2.2.4** · pino **10.4.0** · winston **3.19.0** · @prometheus-io/client **0.16.1** (el paquete `prom-client`
está deprecado en npm: «prom-client has been replaced by @prometheus-io/client»). Imágenes: `jaegertracing/jaeger:2.22.0`,
`rabbitmq:4.4.1-management`, `apache/kafka:4.4.0`, `grafana/loki:3.7.9`, `prom/prometheus:v3.15.1`,
`grafana/grafana:13.2.4`.

## Ejecutar

```bash
cd examples/microservicios/modulo-25
npm ci
docker compose up -d --wait        # Jaeger :16686, RabbitMQ :5672, Kafka :9092, Loki :3100, Prometheus :9090, Grafana :3000
OTEL_SERVICE_NAME=inventario TRAZAS=otlp node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/inventario.js &
OTEL_SERVICE_NAME=pedidos TRAZAS=otlp node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/pedidos.js &
curl -X POST localhost:3130/pedidos/TEC-1   # y abre http://localhost:16686 (Jaeger) o http://localhost:3000 (Grafana)
docker compose down -v
```

## Verificar

```bash
./verificar.sh              # sin infraestructura: 19 tests, demos y errores comunes
./verificar.sh --externo    # además F131 con los brokers que YA estén arriba (omite, avisando, los que no respondan)
./verificar.sh --compose    # levanta todo con Docker y comprueba Jaeger, RabbitMQ, Kafka, Loki y Prometheus
```

Cada paso guarda su salida en `logs/NN-*.log` y toda la ejecución en `logs/verificar.log`. Si algo falla, sigue con
lo demás, lista los fallos y termina con `RESULTADO: FALLA` y código 1; si todo va bien termina con
`RESULTADO: OK · Módulo 21 (Observabilidad) verificado`. Sin Node.js o sin Docker (con `--compose`) lo dice con un
mensaje claro.
