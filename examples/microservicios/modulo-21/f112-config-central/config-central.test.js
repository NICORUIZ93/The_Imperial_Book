// Módulo 17 · F112 · Ejecuta: node --test f112-config-central/config-central.test.js
// Por defecto usa el doble en memoria; contra el Consul real: CONSUL_REAL=1 node --test f112-config-central/config-central.test.js
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { consulParaTests } from '../comun/consul.js';
import { combinar, leerConfig, observarConfig } from './config-central.js';

const prefijo = `config/test-${process.pid}/`; // prefijo propio: no pisa la configuración del laboratorio
let entorno;
before(async () => { entorno = await consulParaTests(); });
after(async () => {
  await entorno.consul.kv.del({ key: prefijo, recurse: true }).catch(() => {});
  await entorno.detener();
});
const poner = (clave, valor) => entorno.consul.kv.set({ key: prefijo + clave, value: valor });

test('capas: por defecto < Consul < entorno', () => {
  const { config } = combinar([['pagos.timeoutMs', '1500'], ['funciones.envioGratis', 'true']], { PAGOS_TIMEOUT_MS: '300' });
  assert.deepEqual(config, { 'pagos.timeoutMs': 300, 'pedidos.montoMaximo': 5000000, 'funciones.envioGratis': true });
});

test('valores inválidos y claves desconocidas se rechazan sin romper el resto', () => {
  const { config, rechazadas } = combinar([['pagos.timeoutMs', 'rapido'], ['color', 'azul']], {});
  assert.equal(config['pagos.timeoutMs'], 2000);
  assert.deepEqual(rechazadas, ['consul: pagos.timeoutMs debe ser un entero y llegó "rapido"', 'consul: clave desconocida: color']);
});

test('lee del KV de Consul al arrancar', async () => {
  await poner('pagos.timeoutMs', '1500');
  await poner('pedidos.montoMaximo', '3000000');
  const { config } = await leerConfig(entorno.consul, { prefijo, env: {} });
  assert.deepEqual(config, { 'pagos.timeoutMs': 1500, 'pedidos.montoMaximo': 3000000, 'funciones.envioGratis': false });
});

test('recarga en caliente cuando cambia una clave y conserva el valor anterior si el nuevo es inválido', async () => {
  const { config: inicial } = await leerConfig(entorno.consul, { prefijo, env: {} });
  const observador = observarConfig(entorno.consul, { prefijo, env: {}, inicial });
  try {
    const cambio = once(observador, 'cambio');
    await poner('pagos.timeoutMs', '800');
    const [config, claves] = await cambio;
    assert.equal(config['pagos.timeoutMs'], 800);
    assert.deepEqual(claves, ['pagos.timeoutMs']);

    const rechazo = once(observador, 'rechazo');
    await poner('pagos.timeoutMs', 'ochocientos');
    assert.deepEqual(await rechazo, ['consul: pagos.timeoutMs debe ser un entero y llegó "ochocientos"']);
    assert.equal(observador.actual()['pagos.timeoutMs'], 800);
  } finally {
    observador.detener();
  }
});
