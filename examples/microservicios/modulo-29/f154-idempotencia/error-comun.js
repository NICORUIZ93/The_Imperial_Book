// Módulo 25 · F154 · Error común: deduplicar por offset de Kafka. Ejecuta: node f154-idempotencia/error-comun.js
// Un reintento del productor (sin idempotencia) escribe el mismo evento en OTRO offset: la deduplicación por offset no lo ve.
const entregas = [
  { particion: 0, offset: 0, evento: { id: 'C-1', puntos: 10 } },
  { particion: 0, offset: 1, evento: { id: 'C-1', puntos: 10 } },
];
function contar(clave) {
  const vistos = new Set();
  let puntos = 0;
  for (const e of entregas) {
    const k = clave(e);
    if (vistos.has(k)) continue;
    vistos.add(k);
    puntos += e.evento.puntos;
  }
  return puntos;
}
console.log(`MAL  → clave partición+offset: puntos = ${contar((e) => `${e.particion}:${e.offset}`)}`);
console.log(`BIEN → clave id del evento:     puntos = ${contar((e) => e.evento.id)}`);
