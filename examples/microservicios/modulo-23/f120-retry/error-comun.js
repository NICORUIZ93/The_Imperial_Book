// Módulo 19 · F120 · ERROR COMÚN: reintentar un POST que no es idempotente crea duplicados.
// Toxiproxy añade 600 ms de latencia a la RESPUESTA: el inventario sí crea la reserva, pero el cliente (timeout de
// 300 ms) cree que falló y reintenta. Requisitos: infraestructura arriba. Ejecuta: node f120-retry/error-comun.js
import { randomUUID } from 'node:crypto';
import { lento, sanar, control, INVENTARIO_URL } from '../comun/toxiproxy.js';
import { reintentar } from './reintentar.js';

async function reservar(cabeceras) {
  await control('/reiniciar', 'POST');
  const resultado = await reintentar(async () => {
    const r = await fetch(`${INVENTARIO_URL}/reservas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...cabeceras },
      body: JSON.stringify({ sku: '7', cantidad: 1 }),
      signal: AbortSignal.timeout(300),
    });
    return r.json();
  }, { intentos: 3, baseMs: 50 }).catch((error) => `el cliente se rinde: ${error.name}`);
  await new Promise((ok) => setTimeout(ok, 700)); // deja que lleguen las respuestas atrasadas
  const { intentosDeReserva, reservasCreadas } = await control('/contador');
  console.log(`   cliente: ${JSON.stringify(resultado)} · inventario: ${intentosDeReserva} POST recibidos, ${reservasCreadas} reservas creadas`);
}

await sanar();
await lento('inventario', 600);
console.log('== MAL: POST /reservas con reintentos y sin clave de idempotencia');
await reservar({});
console.log('== BIEN: el mismo POST con la cabecera Idempotency-Key (la misma en los 3 intentos)');
await reservar({ 'idempotency-key': randomUUID() });
await sanar();
