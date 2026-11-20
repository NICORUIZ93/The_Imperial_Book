// Módulo 15 · F103 · Database-per-service: el servicio INVENTARIO es el único dueño de la base inventario_db.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, pg 8.23.1. PostgreSQL 18.7 con Docker Compose.
import express from 'express';
import pg from 'pg';
import { pgUrl } from '../config.js';

export async function crearInventario() {
  // Usuario propio: inventario_app solo puede entrar a inventario_db (ver initdb/01-bases.sql).
  const pool = new pg.Pool({ connectionString: pgUrl('inventario_db', 'inventario_app', 'inventario'), max: 5 });
  await pool.query(`
    DROP TABLE IF EXISTS stock;
    CREATE TABLE stock (sku TEXT PRIMARY KEY, disponible INTEGER NOT NULL CHECK (disponible >= 0));
    INSERT INTO stock VALUES ('TEC-001', 3), ('MOU-001', 0);
  `);

  const app = express();
  app.use(express.json());

  // La API es el ÚNICO camino para que otro servicio conozca o cambie el stock.
  app.get('/stock/:sku', async (req, res) => {
    const { rows } = await pool.query('SELECT sku, disponible FROM stock WHERE sku = $1', [req.params.sku]);
    if (rows.length === 0) return res.status(404).json({ error: 'SKU desconocido' });
    res.json(rows[0]);
  });

  app.post('/reservas', async (req, res) => {
    const { sku, cantidad } = req.body;
    // Descuento atómico: la condición y el cambio van en la misma sentencia.
    const { rows } = await pool.query(
      'UPDATE stock SET disponible = disponible - $2 WHERE sku = $1 AND disponible >= $2 RETURNING disponible',
      [sku, cantidad],
    );
    if (rows.length === 0) return res.status(409).json({ error: 'Stock insuficiente' });
    res.status(201).json({ sku, reservado: cantidad, disponible: rows[0].disponible });
  });

  return { app, pool };
}
