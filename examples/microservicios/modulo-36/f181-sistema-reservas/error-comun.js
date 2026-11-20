// Módulo 32 · F181 · ERROR COMÚN: el cliente reintenta el POST (se le cortó la conexión, pulsó dos veces) SIN
// Idempotency-Key. El servidor no puede saber que es la misma compra: dos reservas y dos cobros.
// Ejecuta: node f181-sistema-reservas/error-comun.js
import { esperarFinal, montarSistema } from './montaje.js';

const s = await montarSistema();
const cuerpo = JSON.stringify({ eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' });
for (const conClave of [false, true]) {
  const antes = s.stats.cobros;
  const ids = [];
  for (let i = 0; i < 2; i++) { // el mismo POST, dos veces
    const r = await fetch(`${s.reservasUrl}/reservas`, { method: 'POST', body: cuerpo,
      headers: { 'content-type': 'application/json', ...(conClave ? { 'idempotency-key': 'compra-77' } : {}) } });
    ids.push((await r.json()).reservaId);
  }
  for (const id of ids) await esperarFinal(s.reservasUrl, id);
  console.log(`${conClave ? 'con Idempotency-Key' : 'sin Idempotency-Key'}: reservas ${[...new Set(ids)].join(', ')} · cobros al cliente: ${s.stats.cobros - antes}`);
}
await s.cerrar();
