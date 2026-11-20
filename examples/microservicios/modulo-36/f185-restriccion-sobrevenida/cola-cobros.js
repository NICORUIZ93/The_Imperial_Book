// Módulo 32 · F185 · El rediseño del ADR-0007 en el orquestador local: los cobros salen de la ruta síncrona y se
// despachan a un ritmo fijo (por defecto 18/s, por debajo del límite de 20/s del proveedor), en orden de llegada.
// Es el equivalente local de la cola «cobros» de Temporal con maxTaskQueueActivitiesPerSecond: 18 (f182/worker.js).
export function limitarCobros(actividades, porSegundo = 18) {
  const hueco = 1000 / porSegundo;
  let siguiente = 0; // instante (ms) en que sale el próximo cobro
  const turno = () => {
    const ahora = Date.now();
    siguiente = Math.max(siguiente, ahora);
    const espera = siguiente - ahora;
    siguiente += hueco;
    return new Promise((ok) => setTimeout(ok, espera));
  };
  return {
    ...actividades,
    async cobrar(r) { await turno(); return actividades.cobrar(r); },
    async reembolsar(r) { await turno(); return actividades.reembolsar(r); }, // también cuenta contra el límite
  };
}
