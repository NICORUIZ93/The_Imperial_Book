// Módulo 31 · F178 · Relevo: lee los cambios del monolito desde la última posición, los traduce con la ACL y los
// aplica en la base del servicio nuevo. Idempotente: aplicar dos veces el mismo cambio deja el mismo estado.
import { traducir } from './acl.js';

export function sincronizar(monolito, servicio, { lote = 100 } = {}) {
  const desde = servicio.prepare("SELECT pos FROM posicion WHERE fuente = 'monolito'").get().pos;
  const cambios = monolito.prepare('SELECT * FROM CAMBIOS WHERE pos > ? ORDER BY pos LIMIT ?').all(desde, lote);
  const upsert = servicio.prepare(`INSERT INTO pedido (id, cliente_id, estado, total_centimos) VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET cliente_id = excluded.cliente_id, estado = excluded.estado, total_centimos = excluded.total_centimos`);
  const borrar = servicio.prepare('DELETE FROM pedido WHERE id = ?');
  const avanzar = servicio.prepare("UPDATE posicion SET pos = ? WHERE fuente = 'monolito'");
  // El dato y la posición en la MISMA transacción local: si el proceso muere a mitad, se reintenta desde la posición.
  servicio.exec('BEGIN');
  try {
    for (const c of cambios) {
      if (c.op === 'd') borrar.run(c.num_ped);
      else { const p = traducir(c); upsert.run(p.id, p.clienteId, p.estado, p.totalCentimos); }
      avanzar.run(c.pos);
    }
    servicio.exec('COMMIT');
  } catch (e) { servicio.exec('ROLLBACK'); throw e; }
  return cambios.length;
}
