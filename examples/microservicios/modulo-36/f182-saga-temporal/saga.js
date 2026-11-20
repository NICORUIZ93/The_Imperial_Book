// Módulo 32 · F182 · La saga de una reserva: reservar plaza -> cobrar (proveedor externo) -> confirmar.
// Si un paso falla, deshace los anteriores en orden inverso. Sin imports: corre igual dentro del sandbox determinista
// de un workflow de Temporal (workflows.js) y en el orquestador local o en los tests (orquestador-local.js).
export async function sagaReserva(reserva, act) {
  const compensaciones = []; // pila: la última en entrar es la primera en deshacerse
  const hechos = [];
  try {
    await act.reservarPlaza(reserva);
    hechos.push('reservarPlaza');
    compensaciones.push(['liberarPlaza', () => act.liberarPlaza(reserva)]);

    const { cobroId } = await act.cobrar(reserva);
    hechos.push('cobrar');
    compensaciones.push(['reembolsar', () => act.reembolsar({ reservaId: reserva.reservaId, cobroId })]);

    await act.confirmar({ ...reserva, cobroId });
    hechos.push('confirmar');
    return { reservaId: reserva.reservaId, estado: 'CONFIRMADA', hechos, compensadas: [] };
  } catch (error) {
    // En Temporal el fallo de una actividad llega envuelto (ActivityFailure); el motivo real va en error.cause.
    const motivo = error.cause?.message ?? error.message;
    const compensadas = [];
    for (const [nombre, deshacer] of compensaciones.reverse()) {
      await deshacer(); // las compensaciones son idempotentes y se reintentan hasta que salen bien
      compensadas.push(nombre);
    }
    await act.cancelar({ ...reserva, motivo });
    return { reservaId: reserva.reservaId, estado: 'CANCELADA', motivo, hechos, compensadas };
  }
}
