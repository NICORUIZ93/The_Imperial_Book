// Módulo 19 · F119 · Tests del circuito (sin red: la acción se inyecta). Ejecuta: node --test f119-circuit-breaker/circuito.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as dormir } from 'node:timers/promises';
import { crearCircuitoDeInventario, ErrorDeNegocio, estadoDe } from './cliente-inventario.js';

/** Acción falsa: responde lo que diga `modo.actual` y cuenta cuántas veces la llaman de verdad. */
function dependenciaFalsa() {
  const modo = { actual: 'ok', llamadas: 0 };
  const accion = async (sku) => {
    modo.llamadas += 1;
    if (modo.actual === 'caida') throw new Error('ECONNREFUSED');
    if (modo.actual === '404') throw new ErrorDeNegocio(404, `sku ${sku} desconocido`);
    return { sku, stock: 12 };
  };
  return { modo, accion };
}
const OPCIONES = { volumeThreshold: 4, resetTimeout: 200 };

test('cerrado: deja pasar las llamadas y devuelve el resultado', async () => {
  const { accion } = dependenciaFalsa();
  const circuito = crearCircuitoDeInventario('', OPCIONES, accion);
  assert.deepEqual(await circuito.fire('7'), { sku: '7', stock: 12 });
  assert.equal(estadoDe(circuito), 'CERRADO');
  circuito.shutdown();
});

test('se abre al superar el 50 % de fallos con al menos 4 llamadas, y rechaza sin llamar a la dependencia', async () => {
  const { modo, accion } = dependenciaFalsa();
  const circuito = crearCircuitoDeInventario('', OPCIONES, accion);
  await circuito.fire('7'); await circuito.fire('7');
  modo.actual = 'caida';
  for (let i = 0; i < 3; i += 1) await assert.rejects(circuito.fire('7'), /ECONNREFUSED/);
  assert.equal(estadoDe(circuito), 'ABIERTO');
  const llamadasAntes = modo.llamadas;
  await assert.rejects(circuito.fire('7'), { code: 'EOPENBREAKER' });
  assert.equal(modo.llamadas, llamadasAntes, 'abierto: la dependencia no recibe nada');
  circuito.shutdown();
});

test('semiabierto: una llamada de prueba con éxito lo cierra', async () => {
  const { modo, accion } = dependenciaFalsa();
  const circuito = crearCircuitoDeInventario('', OPCIONES, accion);
  modo.actual = 'caida';
  for (let i = 0; i < 4; i += 1) await assert.rejects(circuito.fire('7'));
  assert.equal(estadoDe(circuito), 'ABIERTO');
  modo.actual = 'ok';
  await dormir(250); // resetTimeout
  assert.equal(estadoDe(circuito), 'SEMIABIERTO');
  await circuito.fire('7');
  assert.equal(estadoDe(circuito), 'CERRADO');
  circuito.shutdown();
});

test('semiabierto: si la llamada de prueba falla, vuelve a abrirse', async () => {
  const { modo, accion } = dependenciaFalsa();
  const circuito = crearCircuitoDeInventario('', OPCIONES, accion);
  modo.actual = 'caida';
  for (let i = 0; i < 4; i += 1) await assert.rejects(circuito.fire('7'));
  await dormir(250);
  await assert.rejects(circuito.fire('7'), /ECONNREFUSED/);
  assert.equal(estadoDe(circuito), 'ABIERTO');
  circuito.shutdown();
});

test('los errores de negocio (404) no cuentan como fallo: el circuito sigue cerrado', async () => {
  const { modo, accion } = dependenciaFalsa();
  const circuito = crearCircuitoDeInventario('', OPCIONES, accion);
  modo.actual = '404';
  for (let i = 0; i < 10; i += 1) await assert.rejects(circuito.fire('404'), ErrorDeNegocio);
  assert.equal(estadoDe(circuito), 'CERRADO');
  assert.equal(circuito.stats.failures, 0);
  circuito.shutdown();
});
