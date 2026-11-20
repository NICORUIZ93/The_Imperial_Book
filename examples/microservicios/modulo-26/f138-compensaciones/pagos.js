// Módulo 22 · F138 · Servicio de pagos con una acción (cobrar) y su compensación (reembolsar), ambas idempotentes.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). En producción, cobros y reembolsos vivirían en tablas con
// clave única por sagaId; aquí, Maps en memoria con las mismas reglas.
//
// Tres reglas de una compensación idempotente:
//   1. Clave estable: la compensación se identifica por el sagaId (no por un id nuevo en cada intento).
//   2. Estado, no deltas: «el pago P queda reembolsado», no «suma 100 al saldo».
//   3. Compensar lo que no existe es válido: deja una «lápida» para que la acción que llegue tarde se rechace.
export class PagosService {
  saldo = new Map([['ana', 1000]]);
  cobros = new Map();       // sagaId → { cliente, monto, estado: 'COBRADO' | 'REEMBOLSADO' }
  lapidas = new Set();      // sagaIds compensados antes de que llegara su cobro
  operaciones = [];         // diario de movimientos de dinero (para comprobar que no hay dobles)

  cobrar(sagaId, cliente, monto) {
    if (this.lapidas.has(sagaId)) return { estado: 'RECHAZADO', motivo: 'la saga ya fue compensada' };
    const previo = this.cobros.get(sagaId);
    if (previo) return { estado: previo.estado, repetido: true };   // reintento del cobro: no cobra dos veces
    this.saldo.set(cliente, this.saldo.get(cliente) - monto);
    this.cobros.set(sagaId, { cliente, monto, estado: 'COBRADO' });
    this.operaciones.push(`cobro ${sagaId} -${monto}`);
    return { estado: 'COBRADO' };
  }

  reembolsar(sagaId) {
    const cobro = this.cobros.get(sagaId);
    if (!cobro) { this.lapidas.add(sagaId); return { estado: 'SIN_COBRO' }; }   // regla 3
    if (cobro.estado === 'REEMBOLSADO') return { estado: 'REEMBOLSADO', repetido: true }; // regla 2: ya está
    this.saldo.set(cobro.cliente, this.saldo.get(cobro.cliente) + cobro.monto);
    cobro.estado = 'REEMBOLSADO';
    this.operaciones.push(`reembolso ${sagaId} +${cobro.monto}`);
    return { estado: 'REEMBOLSADO' };
  }
}
