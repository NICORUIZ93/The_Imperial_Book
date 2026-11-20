// Módulo 15 · Direcciones de las bases del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  PG_HOST=otro PG_PORT=5432 MONGO_URL=mongodb://otro:27017/tienda node ...
const host = process.env.PG_HOST ?? 'localhost';
const port = process.env.PG_PORT ?? '5519';

// pgUrl('f102') → postgresql://tienda:tienda@localhost:5519/f102
export function pgUrl(base, usuario = 'tienda', clave = 'tienda') {
  return `postgresql://${usuario}:${clave}@${host}:${port}/${base}`;
}

export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27019/tienda';
