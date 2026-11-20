// Módulo 24 · F151 · ERROR COMÚN: la fitness function mide la MEDIA de latencia. La versión degradada (2 % de pedidos a
// 450 ms) pasa con nota si miras la media, y suspende si miras el p99, que es lo que sufren los clientes.
// Requisitos: Node.js 26.13.1 LTS y prom-client 15.1.3. Ejecuta: node f151-fitness/error-comun.js
import { once } from 'node:events';
import { cuantil, parsear } from './fitness.js';

process.env.PCT_LENTAS = '2'; process.env.LENTA_MS = '450';
const { crearServidor } = await import('./servicio.js');
const servidor = crearServidor().listen(0);
await once(servidor, 'listening');
const base = `http://127.0.0.1:${servidor.address().port}`;
for (let lote = 0; lote < 10; lote++) await Promise.all(Array.from({ length: 100 }, (_, i) => fetch(`${base}/pedidos/p${lote * 100 + i}`).then((r) => r.text())));
const m = parsear(await fetch(`${base}/metrics`).then((r) => r.text()));
const valor = (nombre) => m.find((s) => s.nombre === nombre && s.etiquetas.ruta === '/pedidos').valor;
const media = valor('http_request_duration_seconds_sum') / valor('http_request_duration_seconds_count');
const p99 = cuantil(0.99, m.filter((s) => s.nombre === 'http_request_duration_seconds_bucket').map((s) => ({ le: s.etiquetas.le === '+Inf' ? Infinity : Number(s.etiquetas.le), cuenta: s.valor })));
console.log(`MAL  media de latencia: ${Math.round(media * 1000)} ms  -> ${media <= 0.3 ? '✔ «pasa»' : '✘'} (límite 300 ms)`);
console.log(`BIEN p99 de latencia:   ${Math.round(p99 * 1000)} ms -> ${p99 <= 0.3 ? '✔' : '✘ suspende'} (límite 300 ms)`);
servidor.close();
