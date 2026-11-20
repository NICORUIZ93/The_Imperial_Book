// Módulo 26 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  KAFKA_BROKERS=... SCHEMA_REGISTRY_URL=... AMQP_URL=... NATS_URL=... node ...
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
export const SCHEMA_REGISTRY_URL = process.env.SCHEMA_REGISTRY_URL ?? 'http://localhost:8081';
export const AMQP_URL = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';
export const NATS_URL = process.env.NATS_URL ?? 'nats://localhost:4222';
