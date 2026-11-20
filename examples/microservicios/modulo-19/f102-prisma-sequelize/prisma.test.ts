// Verificación F102 (Prisma): npm run generate && node --import tsx --test f102-prisma-sequelize/prisma.test.ts
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './prisma-repo.ts';

const prisma = conectar();
before(() => prepararEsquema());
beforeEach(() => prisma.$executeRawUnsafe('TRUNCATE pedidos, clientes RESTART IDENTITY'));
after(() => prisma.$disconnect());

test('guarda un cliente con sus pedidos y los lee con la forma pedida', async () => {
  await crearClienteConPedidos(prisma, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
  assert.deepEqual(await pedidosDe(prisma, 'ana@correo.co'), {
    nombre: 'Ana',
    pedidos: [{ total: 120000, estado: 'CREADO' }, { total: 50000, estado: 'CREADO' }],
  });
  assert.equal(await totalVendido(prisma), 170000);
});

test('si un pedido falla, $transaction deshace también el cliente', async () => {
  await assert.rejects(crearClienteConPedidos(prisma, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]));
  assert.equal(await pedidosDe(prisma, 'luis@correo.co'), null);
  assert.equal(await totalVendido(prisma), 0);
});

test('el email repetido produce el error P2002 (restricción única)', async () => {
  await crearClienteConPedidos(prisma, { nombre: 'Ana', email: 'ana@correo.co' }, []);
  await assert.rejects(crearClienteConPedidos(prisma, { nombre: 'Otra', email: 'ana@correo.co' }, []), { code: 'P2002' });
});
