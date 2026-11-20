// Módulo 27 · F164 · tests: node --test f164-service-mesh/malla.test.js  (requiere ./pki/generar.sh)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arrancarAntes } from './antes.js';
import { arrancarDespues, permitido, POLITICA } from './despues.js';
import { credenciales } from '../comun/pki.js';
import { llamar } from '../comun/cliente.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';

test('ANTES: llamar a la app directamente se salta el gateway (vulnerable)', async () => {
  const a = await arrancarAntes();
  assert.equal((await llamar(`http://127.0.0.1:${a.gw.puerto}/admin/ajustes`, { metodo: 'POST' })).status, 403);
  assert.equal((await llamar(`http://127.0.0.1:${a.app.puerto}/admin/ajustes`, { metodo: 'POST' })).status, 200);
  await a.cerrar();
});

test('DESPUÉS: el sidecar deniega por defecto y permite solo lo declarado', async () => {
  const d = await arrancarDespues();
  const S = `https://127.0.0.1:${d.sidecar.puerto}`;
  assert.equal((await llamar(`${S}/admin/ajustes`, { metodo: 'POST', tls: credenciales('pedidos') })).status, 403);
  assert.equal((await llamar(`${S}/reservas`, { metodo: 'POST', tls: credenciales('catalogo') })).status, 403);
  assert.equal((await llamar(`${S}/reservas`, { metodo: 'POST', tls: credenciales('pedidos') })).status, 200);
  assert.ok((await llamar(`http://127.0.0.1:${d.sidecar.puerto}/stock`)).status !== 200, 'HTTP plano al sidecar no debe pasar');
  await d.cerrar();
});

test('permitido(): reglas L7 no coinciden en L4 (ztunnel sin waypoint)', () => {
  const p = { identidad: `${TD}/pedidos`, metodo: 'GET', ruta: '/stock' };
  assert.equal(permitido(POLITICA, { ...p, capa: 'L7' }), true);
  assert.equal(permitido(POLITICA, { ...p, capa: 'L4' }), false);
  const soloL4 = { reglas: [{ de: [`${TD}/pedidos`] }] };
  assert.equal(permitido(soloL4, { ...p, capa: 'L4' }), true);
});
