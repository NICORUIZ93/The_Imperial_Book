// F094 · Error común: productor rápido + consumidor lento + ignorar write() = memoria sin límite.
// Ejecuta (con un heap pequeño para verlo rápido): node --max-old-space-size=64 f094-backpressure/sin-freno.js
import { Writable } from 'node:stream';

const lento = new Writable({
  objectMode: true,
  write(evento, _c, listo) { setTimeout(listo, 10); }, // 10 ms por evento
});
let escritos = 0;
const intervalo = setInterval(() => {
  // 50 eventos de ~64 KiB cada 5 ms; write() devuelve false desde el evento 16, pero lo ignoramos.
  for (let i = 0; i < 50; i++) lento.write({ id: escritos++, datos: new Array(8192).fill(escritos) });
  console.log(`en buffer: ${lento.writableLength} eventos · heap: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MiB`);
}, 5);
setTimeout(() => clearInterval(intervalo), 10_000).unref();
