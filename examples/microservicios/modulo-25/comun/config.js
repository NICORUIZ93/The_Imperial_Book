// Módulo 21 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  AMQP_URL=... KAFKA_BROKERS=... LOKI_URL=... node ...
export const AMQP_URL = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
export const LOKI_URL = process.env.LOKI_URL ?? 'http://localhost:3100';
export const OTLP_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';
