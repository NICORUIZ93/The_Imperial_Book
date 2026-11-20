// Módulo 15 · F102 · Aplica sql/001-esquema.sql en la base f102 con el driver pg (no necesitas tener psql instalado).
// Ejecuta: node f102-prisma-sequelize/preparar.js
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { pgUrl } from '../config.js';

export async function prepararEsquema() {
  const sql = await readFile(new URL('./sql/001-esquema.sql', import.meta.url), 'utf8');
  const cliente = new pg.Client({ connectionString: pgUrl('f102') });
  await cliente.connect();
  try {
    await cliente.query(sql); // varias sentencias separadas por ; en una sola llamada
  } finally {
    await cliente.end();
  }
}

if (import.meta.main) {
  await prepararEsquema();
  console.log('Esquema aplicado en f102: tablas clientes y pedidos');
}
