// Módulo 22 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  AMQP_URL=... REDIS_URL=... MONGO_URL=... node ...
export const AMQP_URL = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';
export const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
