// Módulo 18 · F113 · Ejecuta: node --test f113-rest/clientes.test.js
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { clienteAxios } from './cliente-axios.js';
import { clienteFetch } from './cliente-fetch.js';
import { crearInventario } from './servicio-inventario.js';

const servidor = crearInventario();
let base;
let apagado; // URL de un puerto donde ya no escucha nadie
before(async () => {
  await new Promise((ok) => servidor.listen(0, ok));
  base = `http://localhost:${servidor.address().port}`;
  const temporal = crearInventario();
  await new Promise((ok) => temporal.listen(0, ok));
  apagado = `http://localhost:${temporal.address().port}`;
  await new Promise((ok) => temporal.close(ok));
});
after(() => { servidor.closeAllConnections(); servidor.close(); });

// El MISMO contrato para los dos clientes: quien los usa no distingue cuál hay debajo.
for (const [nombre, crear] of [['fetch', clienteFetch], ['axios', clienteAxios]]) {
  describe(`cliente con ${nombre}`, () => {
    test('200 → devuelve el JSON ya convertido y envía x-request-id', async () => {
      const dato = await crear(base).existencias('TEC-1');
      assert.equal(dato.disponibles, 12);
      assert.match(dato.requestId, /^[0-9a-f-]{36}$/);
    });
    test('404 → NO_ENCONTRADO', async () => {
      await assert.rejects(crear(base).existencias('NO-HAY'), { name: 'ErrorDeInventario', tipo: 'NO_ENCONTRADO' });
    });
    test('503 → NO_DISPONIBLE', async () => {
      await assert.rejects(crear(base).existencias('ROTO'), { tipo: 'NO_DISPONIBLE', message: 'inventario respondió 503' });
    });
    test('respuesta lenta → TIEMPO_AGOTADO sin esperar los 1500 ms', async () => {
      const inicio = performance.now();
      await assert.rejects(crear(base, { timeoutMs: 200 }).existencias('LENTO'), { tipo: 'TIEMPO_AGOTADO' });
      assert.ok(performance.now() - inicio < 1000);
    });
    test('servicio apagado → NO_DISPONIBLE con ECONNREFUSED', async () => {
      await assert.rejects(crear(apagado).existencias('TEC-1'), { tipo: 'NO_DISPONIBLE', message: /ECONNREFUSED/ });
    });
  });
}
