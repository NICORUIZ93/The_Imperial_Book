// Módulo 31 · F178 · Conciliación: compara las dos bases (traduciendo el legado con la misma ACL) y lista diferencias.
// Es la red de seguridad de la coexistencia: se ejecuta cada noche (o cada hora) y alerta si algo no cuadra.
import { traducir } from './acl.js';

export function conciliar(monolito, servicio) {
  const legado = new Map(monolito.prepare('SELECT NUM_PED AS num_ped, COD_CLI AS cod_cli, EST AS est, IMPORTE AS importe FROM PEDIDOS').all()
    .map((f) => [f.num_ped, traducir(f)]));
  const nuevo = new Map(servicio.prepare('SELECT id, cliente_id AS clienteId, estado, total_centimos AS totalCentimos FROM pedido').all()
    .map((f) => [f.id, { ...f }]));
  const diferencias = [];
  for (const [id, p] of legado) {
    const n = nuevo.get(id);
    if (!n) diferencias.push(`${id}: falta en el servicio nuevo`);
    else for (const campo of ['clienteId', 'estado', 'totalCentimos']) {
      if (p[campo] !== n[campo]) diferencias.push(`${id}.${campo}: monolito=${p[campo]} servicio=${n[campo]}`);
    }
  }
  for (const id of nuevo.keys()) if (!legado.has(id)) diferencias.push(`${id}: sobra en el servicio nuevo`);
  return { revisados: legado.size, diferencias };
}
