// Módulo 32 · F181 · Inventario de plazas por evento (en memoria; en el proyecto real, PostgreSQL con su propia base).
// Las dos operaciones son idempotentes por reservaId: repetirlas (reintentos de Temporal) no cambia el resultado.
export class SinPlazas extends Error { constructor(eventoId) { super(`sin plazas en ${eventoId}`); this.name = 'SinPlazas'; } }

export function crearInventario(aforos) {
  const libres = new Map(Object.entries(aforos));
  const ocupadas = new Map(); // reservaId -> eventoId
  return {
    reservarPlaza({ reservaId, eventoId }) {
      if (ocupadas.has(reservaId)) return { reservaId, repetida: true };
      if (!libres.has(eventoId) || libres.get(eventoId) < 1) throw new SinPlazas(eventoId);
      libres.set(eventoId, libres.get(eventoId) - 1); ocupadas.set(reservaId, eventoId);
      return { reservaId, repetida: false };
    },
    liberarPlaza({ reservaId }) {
      const eventoId = ocupadas.get(reservaId);
      if (!eventoId) return { reservaId, liberada: false }; // ya liberada (o nunca reservada): no hace nada
      ocupadas.delete(reservaId); libres.set(eventoId, libres.get(eventoId) + 1);
      return { reservaId, liberada: true };
    },
    libres: (eventoId) => libres.get(eventoId),
  };
}
