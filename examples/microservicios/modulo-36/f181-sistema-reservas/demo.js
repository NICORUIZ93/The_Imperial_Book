// Módulo 32 · F181 · Demo del sistema de reservas con pago externo. Ejecuta: node f181-sistema-reservas/demo.js
import { esperarFinal, montarSistema } from './montaje.js';

const s = await montarSistema({ aforo: 2 });
const pedir = async (cuerpo, clave) => {
  const r = await fetch(`${s.reservasUrl}/reservas`, { method: 'POST', body: JSON.stringify(cuerpo),
    headers: { 'content-type': 'application/json', ...(clave ? { 'idempotency-key': clave } : {}) } });
  return { http: r.status, location: r.headers.get('location'), ...(await r.json()) };
};
const base = { eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' };
const casos = [
  ['pago aprobado', { ...base }, 'a1'],
  ['mismo POST repetido (Idempotency-Key a1)', { ...base }, 'a1'],
  ['tarjeta rechazada', { ...base, tarjeta: '4000-RECHAZAR' }, 'b2'],
  ['falla la confirmación', { ...base, fallarAlConfirmar: true }, 'c3'],
  ['otra reserva', { ...base }, 'd4'],
  ['sin plazas (aforo 2)', { ...base }, 'e5'],
];
for (const [nombre, cuerpo, clave] of casos) {
  const r = await pedir(cuerpo, clave);
  const final = await esperarFinal(s.reservasUrl, r.reservaId);
  console.log(`${nombre.padEnd(41)} POST ${r.http} ${r.location.padEnd(14)} -> ${final.estado}${final.motivo ? ` (${final.motivo})` : ''}`);
}
console.log(`proveedor: ${s.stats.cobros} cobros, ${s.stats.reembolsos} reembolso(s) · plazas libres: ${s.inventario.libres('concierto-1')}`);
await s.cerrar();
