// Módulo 25 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  PG_URL=... KAFKA_BROKERS=... TEMPORAL_ADDRESS=... node ...
export const PG_URL = process.env.PG_URL ?? 'postgres://academia:academia@localhost:5432/academia';
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
export const CONNECT_URL = process.env.CONNECT_URL ?? 'http://localhost:8083';
