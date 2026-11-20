// Módulo 19 · F121 · Simulación del fallo: (A) una ráfaga contra DOS instancias que comparten el límite en Redis y
// (B) Toxiproxy tumba Redis: qué hace el limitador con cada estrategia (memoria, abrir, cerrar).
// Requisitos: infraestructura arriba. Ejecuta: node f121-rate-limiting/simulacion.js
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { apagar, encender, sanar, dormir, REDIS_URL } from '../comun/toxiproxy.js';
import { crearApp } from './servicio.js';

const registro = console.log;
console.log = () => {}; // silencia el log de los servicios; la simulación escribe con registro()

async function instancia(puerto, siRedisFalla) {
  const { app, redis } = await crearApp({ redisUrl: REDIS_URL, limite: 5, ventanaS: 10, siRedisFalla, instancia: String(puerto) });
  const servidor = app.listen(puerto);
  await once(servidor, 'listening');
  return { cerrar: async () => { servidor.close(); servidor.closeAllConnections(); await redis.destroy(); } };
}
async function rafaga(puertos, cliente, n = 8) {
  const codigos = [];
  for (let i = 0; i < n; i += 1) {
    const r = await fetch(`http://127.0.0.1:${puertos[i % puertos.length]}/api/ofertas`, { headers: { 'x-api-key': cliente } });
    codigos.push(r.status);
  }
  return codigos.join(' ');
}

await sanar();
const cliente = `cliente-${Date.now()}`; // clave nueva en cada ejecución
const instancias = [await instancia(3121, 'memoria'), await instancia(3221, 'memoria'), await instancia(3321, 'abrir'), await instancia(3421, 'cerrar')];

registro('== A. Redis sano: 8 peticiones del mismo cliente alternando entre DOS instancias (límite 5 cada 10 s)');
const sano = await rafaga([3121, 3221], cliente);
registro(`   ${sano}`);
const r429 = await fetch('http://127.0.0.1:3221/api/ofertas', { headers: { 'x-api-key': cliente } });
registro(`   cabeceras del 429: RateLimit-Limit=${r429.headers.get('ratelimit-limit')} RateLimit-Remaining=${r429.headers.get('ratelimit-remaining')} Retry-After=${r429.headers.get('retry-after')}`);

registro('== B. Fallo inyectado: Toxiproxy apaga el proxy "redis"');
await apagar('redis');
await dormir(300); // los clientes Redis notan la desconexión
const memoria = await rafaga([3121, 3221], `${cliente}-b`);
registro(`   SI_REDIS_FALLA=memoria (2 instancias): ${memoria}   <- cada instancia cuenta por su lado: pasan 8 de 8`);
const abrir = await rafaga([3321], `${cliente}-b`);
registro(`   SI_REDIS_FALLA=abrir               : ${abrir}   <- sin límite mientras dure la caída`);
const cerrar = await rafaga([3421], `${cliente}-b`);
registro(`   SI_REDIS_FALLA=cerrar              : ${cerrar}   <- protegido, pero la API queda fuera de servicio`);

registro('== C. Redis vuelve');
await encender('redis');
await dormir(600); // reconnectStrategy: 200 ms
const recuperado = await rafaga([3121, 3221], `${cliente}-c`);
registro(`   ${recuperado}`);

for (const i of instancias) await i.cerrar();
assert.equal(sano, '200 200 200 200 200 429 429 429');
assert.equal(memoria, '200 200 200 200 200 200 200 200');
assert.equal(abrir, '200 200 200 200 200 200 200 200');
assert.equal(cerrar, '503 503 503 503 503 503 503 503');
assert.equal(recuperado, '200 200 200 200 200 429 429 429');
registro('OK: el límite se comparte entre instancias con Redis sano y cada estrategia se comportó como se esperaba sin Redis');
