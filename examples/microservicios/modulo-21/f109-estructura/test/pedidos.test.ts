// Módulo 17 · F109 · Tests por capa. Ejecuta: node --test f109-estructura/test/pedidos.test.ts
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { crearApp } from '../src/app.ts';
import { leerConfig } from '../src/config/config.ts';
import { crearCasosDeUso } from '../src/modules/pedidos/aplicacion/casos-de-uso.ts';
import { crearPedido, type Pedido } from '../src/modules/pedidos/dominio/pedido.ts';
import { ErrorDeDominio } from '../src/shared/errores.ts';

describe('dominio (sin servidor, sin base de datos)', () => {
  test('calcula el total del pedido', () => {
    const pedido = crearPedido('P-1', 'Ana', [{ producto: 'Teclado', cantidad: 2, precioUnitario: 120000 }], 5_000_000);
    assert.equal(pedido.total, 240000);
    assert.equal(pedido.estado, 'CREADO');
  });

  test('rechaza un pedido que supera el monto máximo', () => {
    assert.throws(
      () => crearPedido('P-1', 'Ana', [{ producto: 'Servidor', cantidad: 1, precioUnitario: 9_000_000 }], 5_000_000),
      (e: unknown) => e instanceof ErrorDeDominio && e.codigo === 'MONTO_EXCEDIDO',
    );
  });
});

describe('aplicación (con un repositorio falso: el puerto se sustituye sin tocar el caso de uso)', () => {
  test('crear guarda el pedido en el repositorio que le inyectan', async () => {
    const guardados: Pedido[] = [];
    const casos = crearCasosDeUso({
      repositorio: { guardar: async (p) => void guardados.push(p), buscar: async () => undefined },
      ids: { siguiente: () => 'P-77' },
      montoMaximo: 1000,
    });
    const pedido = await casos.crear({ cliente: 'Luis', lineas: [{ producto: 'Cable', cantidad: 1, precioUnitario: 500 }] });
    assert.equal(pedido.id, 'P-77');
    assert.deepEqual(guardados, [pedido]);
  });
});

describe('http (la app completa en un puerto libre)', () => {
  const servidor = crearApp(leerConfig({ PORT: '0', MONTO_MAXIMO: '1000000' }));
  let base = '';
  before(async () => {
    await new Promise<void>((ok) => servidor.listen(0, ok));
    base = `http://localhost:${(servidor.address() as AddressInfo).port}`;
  });
  after(() => servidor.close());

  test('POST /pedidos → 201 y GET /pedidos/P-1 → 200', async () => {
    const res = await fetch(`${base}/pedidos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cliente: 'Ana', lineas: [{ producto: 'Mouse', cantidad: 3, precioUnitario: 50000 }] }),
    });
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), {
      id: 'P-1', cliente: 'Ana', lineas: [{ producto: 'Mouse', cantidad: 3, precioUnitario: 50000 }], total: 150000, estado: 'CREADO',
    });
    assert.equal((await fetch(`${base}/pedidos/P-1`)).status, 200);
  });

  test('una regla de dominio rota se traduce a 422 en la capa http', async () => {
    const res = await fetch(`${base}/pedidos`, { method: 'POST', body: JSON.stringify({ cliente: 'Ana', lineas: [] }) });
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { codigo: 'SIN_LINEAS', detalle: 'El pedido necesita al menos una línea' });
  });

  test('GET /pedidos/P-999 → 404', async () => {
    assert.equal((await fetch(`${base}/pedidos/P-999`)).status, 404);
  });
});
