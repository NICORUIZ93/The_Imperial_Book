// Verificación F103: node --test f103-database-per-service/aislamiento.test.js   (necesita PostgreSQL)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { pgUrl } from '../config.js';
import { arrancar } from './arrancar.js';

let servicios;
let disponible = true;
before(async () => {
  try {
    servicios = await arrancar();
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`PostgreSQL no disponible (${error.code ?? error.name}): tests omitidos`);
  }
});
after(() => servicios?.apagar());

const post = (url, cuerpo) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });

test('un pedido se confirma reservando stock por la API de inventario', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const r = await post(`${servicios.pedidosUrl}/pedidos`, { sku: 'TEC-001', cantidad: 2 });
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { id: 1, sku: 'TEC-001', cantidad: 2, estado: 'CONFIRMADO' });
  const stock = await (await fetch(`${servicios.inventarioUrl}/stock/TEC-001`)).json();
  assert.deepEqual(stock, { sku: 'TEC-001', disponible: 1 });
});

test('sin stock, inventario responde 409 y pedidos guarda el pedido como RECHAZADO', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const r = await post(`${servicios.pedidosUrl}/pedidos`, { sku: 'MOU-001', cantidad: 1 });
  assert.equal(r.status, 409);
  assert.equal((await r.json()).estado, 'RECHAZADO');
});

test('el usuario de pedidos NO puede conectarse a la base de inventario (ni al revés)', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  for (const [base, usuario, clave] of [['inventario_db', 'pedidos_app', 'pedidos'], ['pedidos_db', 'inventario_app', 'inventario']]) {
    const cliente = new pg.Client({ connectionString: pgUrl(base, usuario, clave) });
    await assert.rejects(cliente.connect(), { code: '42501' }); // insufficient_privilege
  }
});

test('cada base contiene solo las tablas de su servicio', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const tablas = async (base, usuario, clave) => {
    const cliente = new pg.Client({ connectionString: pgUrl(base, usuario, clave) });
    await cliente.connect();
    const { rows } = await cliente.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1");
    await cliente.end();
    return rows.map((f) => f.tablename);
  };
  assert.deepEqual(await tablas('pedidos_db', 'pedidos_app', 'pedidos'), ['pedidos']);
  assert.deepEqual(await tablas('inventario_db', 'inventario_app', 'inventario'), ['stock']);
});
