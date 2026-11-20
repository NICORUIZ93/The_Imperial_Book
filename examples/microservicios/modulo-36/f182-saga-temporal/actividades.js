// Módulo 32 · F182 · Actividades de la saga: el código que toca el mundo (inventario, proveedor de pagos, repositorio).
// Temporal las reintenta según la política del workflow; por eso TODAS son idempotentes (Idempotency-Key = reservaId).
// Versiones: Node.js 26.13.1 LTS, @temporalio/activity 1.26.0 (solo para ApplicationFailure).
import { ApplicationFailure } from '@temporalio/activity';
import { SinPlazas } from '../f181-sistema-reservas/inventario.js';

export function crearActividades({ inventario, repo, pagosUrl }) {
  async function llamar(ruta, clave, cuerpo) {
    const r = await fetch(`${pagosUrl}${ruta}`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': clave }, body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(5_000), // nunca esperar al proveedor sin límite
    });
    return { estado: r.status, cuerpo: await r.json(), reintentarEn: r.headers.get('retry-after') };
  }
  return {
    async reservarPlaza(r) {
      try { return inventario.reservarPlaza(r); }
      catch (e) { if (e instanceof SinPlazas) throw ApplicationFailure.nonRetryable(e.message, 'SinPlazas'); throw e; }
    },
    async liberarPlaza(r) { return inventario.liberarPlaza(r); },
    async cobrar(r) {
      const { estado, cuerpo, reintentarEn } = await llamar('/cobros', `cobro-${r.reservaId}`, { reservaId: r.reservaId, importe: r.importe, tarjeta: r.tarjeta });
      if (estado === 201) return { cobroId: cuerpo.cobroId };
      if (estado === 402) throw ApplicationFailure.nonRetryable(`tarjeta rechazada: ${cuerpo.motivo}`, 'PagoRechazado');
      // 429 y 5xx: reintentable (Temporal aplica backoff exponencial). El mensaje lleva el Retry-After para diagnosticar.
      throw ApplicationFailure.retryable(`proveedor respondió ${estado}${reintentarEn ? ` (Retry-After: ${reintentarEn} s)` : ''}`, `Http${estado}`);
    },
    async reembolsar({ reservaId, cobroId }) {
      const { estado } = await llamar('/reembolsos', `reembolso-${reservaId}`, { cobroId });
      if (estado !== 201) throw ApplicationFailure.retryable(`reembolso respondió ${estado}`, `Http${estado}`);
      return { cobroId };
    },
    async confirmar(r) {
      if (r.fallarAlConfirmar) throw ApplicationFailure.nonRetryable('el organizador canceló el evento', 'EventoCerrado'); // para probar la compensación doble
      repo.actualizar(r.reservaId, { estado: 'CONFIRMADA', cobroId: r.cobroId });
    },
    async cancelar(r) { repo.actualizar(r.reservaId, { estado: 'CANCELADA', motivo: r.motivo }); },
  };
}
