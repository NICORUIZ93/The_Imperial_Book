// Módulo 22 · F139 · El agregado Pedido con event sourcing: su estado NO se guarda; se CALCULA a partir de sus eventos.
// Requisitos: Node.js 26.13.1 LTS (JavaScript puro, sin dependencias).
//   decidir(estado, comando) → eventos nuevos (o error de negocio)   ← aquí viven las reglas
//   aplicar(estado, evento)  → estado siguiente                      ← sin reglas: un hecho no se discute
export class ReglaDeNegocio extends Error { name = 'ReglaDeNegocio'; }

export const INICIAL = { existe: false, estado: null, cliente: null, lineas: [], total: 0 };

export function aplicar(estado, { tipo, datos }) {
  switch (tipo) {
    case 'PedidoCreado': return { ...estado, existe: true, estado: 'ABIERTO', cliente: datos.cliente };
    case 'LineaAgregada': return { ...estado, lineas: [...estado.lineas, datos], total: estado.total + datos.cantidad * datos.precio };
    case 'PedidoConfirmado': return { ...estado, estado: 'CONFIRMADO' };
    case 'PedidoCancelado': return { ...estado, estado: 'CANCELADO' };
    default: return estado; // un tipo desconocido (de una versión futura) no rompe la reconstrucción
  }
}

export const reconstruir = (eventos) => eventos.reduce(aplicar, INICIAL);

export function decidir(estado, comando) {
  switch (comando.tipo) {
    case 'Crear':
      if (estado.existe) throw new ReglaDeNegocio('el pedido ya existe');
      return [{ tipo: 'PedidoCreado', datos: { cliente: comando.cliente } }];
    case 'AgregarLinea':
      if (estado.estado !== 'ABIERTO') throw new ReglaDeNegocio(`pedido ${estado.estado ?? 'inexistente'}: no admite líneas`);
      return [{ tipo: 'LineaAgregada', datos: { sku: comando.sku, cantidad: comando.cantidad, precio: comando.precio } }];
    case 'Confirmar':
      if (estado.estado !== 'ABIERTO' || estado.lineas.length === 0) throw new ReglaDeNegocio('solo se confirma un pedido abierto con líneas');
      return [{ tipo: 'PedidoConfirmado', datos: {} }];
    case 'Cancelar':
      if (estado.estado === 'CANCELADO') return []; // idempotente: cancelar dos veces no genera otro evento
      return [{ tipo: 'PedidoCancelado', datos: { motivo: comando.motivo } }];
    default: throw new ReglaDeNegocio(`comando desconocido ${comando.tipo}`);
  }
}

// Ciclo completo de un comando: leer stream → reconstruir → decidir → anexar con la versión leída.
// Si otro escribió entre medias, el almacén lanza ConflictoDeConcurrencia y se REINTENTA desde la lectura.
export async function ejecutar(almacen, pedidoId, comando, { reintentos = 3 } = {}) {
  for (let intento = 1; ; intento++) {
    const { eventos, version } = await almacen.leerStream(`pedido-${pedidoId}`);
    const nuevos = decidir(reconstruir(eventos), comando);
    if (nuevos.length === 0) return version;
    try {
      return await almacen.anexar(`pedido-${pedidoId}`, version, nuevos);
    } catch (error) {
      if (error.name !== 'ConflictoDeConcurrencia' || intento > reintentos) throw error;
    }
  }
}
