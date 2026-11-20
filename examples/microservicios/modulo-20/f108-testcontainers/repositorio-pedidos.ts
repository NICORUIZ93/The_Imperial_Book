// Módulo 16 · F108 · Testcontainers para Node: un repositorio que usa SQL PROPIO de PostgreSQL (ON CONFLICT, jsonb, FILTER).
// Un doble en memoria no puede decirte si este SQL es correcto: hay que ejecutarlo contra un PostgreSQL de verdad.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1; para el test: testcontainers y @testcontainers/postgresql 12.2.2, Docker.
import type { Pool } from 'pg';

export interface Pedido {
  id: string;
  cliente: string;
  total: number;
  estado: 'CREADO' | 'PAGADO' | 'CANCELADO';
  items: { sku: string; cantidad: number }[];
}

export async function migrar(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id      TEXT PRIMARY KEY,
      cliente TEXT NOT NULL,
      total   INTEGER NOT NULL CHECK (total > 0),
      estado  TEXT NOT NULL,
      items   JSONB NOT NULL
    )`);
}

export class RepositorioDePedidos {
  constructor(private readonly pool: Pool) {}

  // «Upsert»: inserta, o si el id ya existe actualiza estado y total. Es idempotente: repetirlo no duplica.
  async guardar(pedido: Pedido): Promise<void> {
    await this.pool.query(
      `INSERT INTO pedidos (id, cliente, total, estado, items) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total`,
      [pedido.id, pedido.cliente, pedido.total, pedido.estado, JSON.stringify(pedido.items)],
    );
  }

  async buscar(id: string): Promise<Pedido | null> {
    const { rows } = await this.pool.query('SELECT id, cliente, total, estado, items FROM pedidos WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  // Operador @> de jsonb: pedidos cuyo arreglo de items CONTIENE un item con ese sku.
  async conSku(sku: string): Promise<string[]> {
    const { rows } = await this.pool.query('SELECT id FROM pedidos WHERE items @> $1::jsonb ORDER BY id', [JSON.stringify([{ sku }])]);
    return rows.map((fila) => fila.id);
  }

  async resumen(cliente: string): Promise<{ pagado: number; pendientes: number }> {
    const { rows } = await this.pool.query(
      `SELECT COALESCE(SUM(total) FILTER (WHERE estado = 'PAGADO'), 0)::int AS pagado,
              (COUNT(*) FILTER (WHERE estado = 'CREADO'))::int AS pendientes
         FROM pedidos WHERE cliente = $1`,
      [cliente],
    );
    return rows[0];
  }
}
