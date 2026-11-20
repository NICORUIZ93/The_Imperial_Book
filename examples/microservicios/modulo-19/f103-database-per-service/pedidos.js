// Módulo 15 · F103 · Database-per-service: el servicio PEDIDOS es dueño de pedidos_db y NO conoce las tablas de inventario.
import express from 'express';
import pg from 'pg';
import { pgUrl } from '../config.js';

export async function crearPedidos({ inventarioUrl }) {
  const pool = new pg.Pool({ connectionString: pgUrl('pedidos_db', 'pedidos_app', 'pedidos'), max: 5 });
  await pool.query(`
    DROP TABLE IF EXISTS pedidos;
    CREATE TABLE pedidos (
      id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      sku      TEXT NOT NULL,          -- referencia LÓGICA al producto: no hay FOREIGN KEY hacia otra base
      cantidad INTEGER NOT NULL,
      estado   TEXT NOT NULL
    );
  `);

  const app = express();
  app.use(express.json());

  app.post('/pedidos', async (req, res) => {
    const { sku, cantidad } = req.body;
    // En lugar de un JOIN o un UPDATE sobre la tabla ajena, PEDIMOS la reserva por la API del dueño del dato.
    const respuesta = await fetch(`${inventarioUrl}/reservas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sku, cantidad }),
      signal: AbortSignal.timeout(2000), // nunca llames a otro servicio sin timeout
    });
    const estado = respuesta.status === 201 ? 'CONFIRMADO' : 'RECHAZADO';
    const { rows } = await pool.query(
      'INSERT INTO pedidos (sku, cantidad, estado) VALUES ($1, $2, $3) RETURNING id, sku, cantidad, estado',
      [sku, cantidad, estado],
    );
    res.status(estado === 'CONFIRMADO' ? 201 : 409).json(rows[0]);
  });

  app.get('/pedidos/:id', async (req, res) => {
    const { rows } = await pool.query('SELECT id, sku, cantidad, estado FROM pedidos WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido desconocido' });
    res.json(rows[0]);
  });

  return { app, pool };
}
