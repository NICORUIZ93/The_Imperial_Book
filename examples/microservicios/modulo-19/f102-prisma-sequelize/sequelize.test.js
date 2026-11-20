// Verificación F102 (Sequelize): node --test f102-prisma-sequelize/sequelize.test.js   (necesita PostgreSQL)
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './sequelize-repo.js';

let db;
let disponible = true;
before(async () => {
  try {
    await prepararEsquema();
    db = conectar();
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`PostgreSQL no disponible (${error.code ?? error.name}): tests omitidos`);
  }
});
beforeEach(async () => { if (disponible) await db.sequelize.query('TRUNCATE pedidos, clientes RESTART IDENTITY'); });
after(async () => { if (db) await db.sequelize.close(); });

test('guarda un cliente con sus pedidos y los lee con un JOIN', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await crearClienteConPedidos(db, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
  assert.deepEqual(await pedidosDe(db, 'ana@correo.co'), {
    nombre: 'Ana',
    pedidos: [{ total: 120000, estado: 'CREADO' }, { total: 50000, estado: 'CREADO' }],
  });
  assert.equal(await totalVendido(db), 170000);
});

test('si un pedido falla, la transacción deshace también el cliente', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await assert.rejects(crearClienteConPedidos(db, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]), { name: 'SequelizeDatabaseError' });
  assert.equal(await pedidosDe(db, 'luis@correo.co'), null);
  assert.equal(await totalVendido(db), 0);
});

test('el email repetido produce SequelizeUniqueConstraintError', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await crearClienteConPedidos(db, { nombre: 'Ana', email: 'ana@correo.co' }, []);
  await assert.rejects(crearClienteConPedidos(db, { nombre: 'Otra', email: 'ana@correo.co' }, []), { name: 'SequelizeUniqueConstraintError' });
});
