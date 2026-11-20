// Módulo 32 · F181 · Repositorio de reservas (en memoria; en el proyecto real, PostgreSQL del servicio de reservas).
export function crearRepositorio() {
  const reservas = new Map();
  return {
    crear(r) { if (!reservas.has(r.reservaId)) reservas.set(r.reservaId, { ...r, estado: 'PENDIENTE', creada: Date.now() }); return reservas.get(r.reservaId); },
    actualizar(id, cambios) { reservas.set(id, { ...reservas.get(id), ...cambios, actualizada: Date.now() }); },
    obtener: (id) => reservas.get(id),
    todas: () => [...reservas.values()],
  };
}
