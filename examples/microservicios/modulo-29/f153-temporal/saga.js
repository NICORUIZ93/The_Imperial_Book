// Módulo 25 · F153 · Pila de compensaciones de una saga orquestada.
// Sin imports de Node: se usa dentro del sandbox determinista de los workflows de Temporal y en tests normales.
export class Saga {
  #compensaciones = [];
  // Registra cómo deshacer un paso YA hecho. Se deshace en orden inverso (último en entrar, primero en salir).
  agregarCompensacion(nombre, fn) {
    this.#compensaciones.push({ nombre, fn });
  }
  // Ejecuta TODAS las compensaciones aunque alguna falle; devuelve qué se compensó y qué no.
  async compensar() {
    const hechas = [];
    const fallidas = [];
    for (const { nombre, fn } of this.#compensaciones.reverse()) {
      try {
        await fn();
        hechas.push(nombre);
      } catch (error) {
        fallidas.push(`${nombre}: ${error.message}`);
      }
    }
    this.#compensaciones = [];
    return { hechas, fallidas };
  }
}

// Orquestador genérico: ejecuta los pasos en orden y, si uno falla, compensa los anteriores.
// pasos = [{ nombre, hacer: () => Promise, deshacer?: () => Promise }]
export async function ejecutarSaga(pasos) {
  const saga = new Saga();
  const hechos = [];
  for (const paso of pasos) {
    try {
      await paso.hacer();
    } catch (error) {
      // En Temporal el error llega como ActivityFailure («Activity task failed»); el motivo real va en cause.
      const motivo = error.cause?.message ?? error.message;
      const { hechas, fallidas } = await saga.compensar();
      return { estado: 'COMPENSADA', fallo: `${paso.nombre}: ${motivo}`, hechos, compensadas: hechas, sinCompensar: fallidas };
    }
    hechos.push(paso.nombre);
    // La compensación se registra DESPUÉS de que el paso termina bien: no se deshace lo que no se hizo.
    if (paso.deshacer) saga.agregarCompensacion(paso.nombre, paso.deshacer);
  }
  return { estado: 'COMPLETADA', hechos, compensadas: [], sinCompensar: [] };
}
