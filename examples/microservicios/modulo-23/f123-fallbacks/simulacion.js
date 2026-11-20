// Módulo 19 · F123 · Simulación del fallo: Toxiproxy tumba el inventario y el catálogo responde con cada estrategia.
// Requisitos: infraestructura arriba. Ejecuta: node f123-fallbacks/simulacion.js
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { apagar, encender, sanar, dormir } from '../comun/toxiproxy.js';
import { crearCatalogo } from './catalogo.js';

await sanar();
const { app, circuito } = crearCatalogo({ log: (linea) => console.log(`   ${linea}`) });
const servidor = app.listen(3123);
await once(servidor, 'listening');
const URL_BASE = 'http://127.0.0.1:3123';
async function pedir(titulo, ruta, opciones) {
  const r = await fetch(`${URL_BASE}${ruta}`, opciones);
  const cuerpo = await r.json();
  if (cuerpo.edadMs !== undefined) cuerpo.edadMs = '<edad>'; // la edad cambia en cada ejecución
  console.log(`   ${titulo} -> ${r.status} ${JSON.stringify(cuerpo)}`);
  return { status: r.status, cuerpo };
}
const comprar = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sku: '7' }) };

console.log('== 1. Inventario sano');
const sano = await pedir('GET /catalogo/7', '/catalogo/7');
await pedir('POST /compras   ', '/compras', comprar);

console.log('== 2. Fallo inyectado: Toxiproxy apaga el proxy "inventario"');
await apagar('inventario');
const cache = await pedir('GET /catalogo/7', '/catalogo/7');   // ya lo vimos: último valor bueno
const defecto = await pedir('GET /catalogo/9', '/catalogo/9'); // nunca lo vimos: valor por defecto
const compra = await pedir('POST /compras   ', '/compras', comprar); // escritura: falla rápido
for (let i = 0; i < 3; i += 1) await fetch(`${URL_BASE}/catalogo/7`); // más fallos: el circuito se abre
const abierto = await pedir('GET /catalogo/7', '/catalogo/7'); // circuito abierto: el fallback ya ni toca la red
await pedir('GET /metricas   ', '/metricas');

console.log('== 3. El inventario vuelve');
await encender('inventario');
await dormir(1100);
const recuperado = await pedir('GET /catalogo/7', '/catalogo/7');

servidor.close(); servidor.closeAllConnections(); circuito.shutdown();
assert.equal(sano.cuerpo.fuente, 'inventario');
assert.deepEqual([cache.cuerpo.fuente, cache.cuerpo.stock, cache.cuerpo.degradado], ['cache', 12, true]);
assert.deepEqual([defecto.cuerpo.fuente, defecto.cuerpo.stock], ['defecto', null]);
assert.equal(compra.status, 503);
assert.equal(abierto.cuerpo.fuente, 'cache');
assert.equal(recuperado.cuerpo.fuente, 'inventario');
console.log('OK: lectura degradada con caché o valor por defecto, escritura rechazada con 503 y recuperación automática');
