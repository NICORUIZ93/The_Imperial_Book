// Módulo 13 · F094 · Backpressure en Streams.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node f094-backpressure/backpressure.js
import { Writable, Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as esperar } from 'node:timers/promises';

// Un destino LENTO: tarda 1 ms por trozo (como un disco ocupado o un cliente HTTP con mala red).
// highWaterMark = 16 trozos: el tamaño del "embudo" antes de pedir que el productor pare.
export function destinoLento(recibidos = []) {
  return new Writable({
    objectMode: true,
    highWaterMark: 16,
    async write(trozo, _codificacion, listo) {
      await esperar(1);
      recibidos.push(trozo);
      listo();
    },
  });
}

// ❌ SIN backpressure: ignora el `false` que devuelve write() y llena la memoria del buffer.
export function escribirSinRespetar(destino, total) {
  let maxEnBuffer = 0;
  for (let i = 0; i < total; i++) {
    destino.write(i); // devuelve false a partir del trozo 16… y lo ignoramos
    maxEnBuffer = Math.max(maxEnBuffer, destino.writableLength);
  }
  destino.end();
  return maxEnBuffer;
}

// ✅ CON backpressure manual: si write() devuelve false, esperamos el evento 'drain'.
export async function escribirRespetando(destino, total) {
  let maxEnBuffer = 0;
  let pausas = 0;
  for (let i = 0; i < total; i++) {
    if (!destino.write(i)) {
      pausas++;
      await new Promise((resolve) => destino.once('drain', resolve));
    }
    maxEnBuffer = Math.max(maxEnBuffer, destino.writableLength);
  }
  destino.end();
  return { maxEnBuffer, pausas };
}

// ✅ La forma recomendada: pipeline() conecta los streams, respeta backpressure y propaga errores y cierres.
export async function conPipeline(total, recibidos = []) {
  const origen = Readable.from((function* () { for (let i = 0; i < total; i++) yield i; })());
  const doble = new Transform({ objectMode: true, transform(n, _c, listo) { listo(null, n * 2); } });
  await pipeline(origen, doble, destinoLento(recibidos));
  return recibidos.length;
}

if (import.meta.main) {
  const TOTAL = 1000;
  console.log(`sin respetar write(): máximo en buffer = ${escribirSinRespetar(destinoLento(), TOTAL)} trozos`);
  const { maxEnBuffer, pausas } = await escribirRespetando(destinoLento(), TOTAL);
  console.log(`esperando 'drain':     máximo en buffer = ${maxEnBuffer} trozos (${pausas} pausas)`);
  console.log(`pipeline():            ${await conPipeline(TOTAL)} trozos entregados, sin tocar la memoria a mano`);
}
