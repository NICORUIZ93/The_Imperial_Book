// dominio/: las reglas del negocio. NO importa nada de http/, infraestructura/ ni librerías externas:
// así se puede probar sin servidor ni base de datos y sobrevive a un cambio de framework.
import { ErrorDeDominio } from '../../../shared/errores.ts';

export interface Linea {
  readonly producto: string;
  readonly cantidad: number;
  readonly precioUnitario: number;
}

export interface Pedido {
  readonly id: string;
  readonly cliente: string;
  readonly lineas: readonly Linea[];
  readonly total: number;
  readonly estado: 'CREADO';
}

export function crearPedido(id: string, cliente: string, lineas: readonly Linea[], montoMaximo: number): Pedido {
  if (cliente.trim() === '') throw new ErrorDeDominio('CLIENTE_VACIO', 'El pedido necesita un cliente');
  if (lineas.length === 0) throw new ErrorDeDominio('SIN_LINEAS', 'El pedido necesita al menos una línea');
  for (const l of lineas) {
    if (!Number.isInteger(l.cantidad) || l.cantidad <= 0) {
      throw new ErrorDeDominio('CANTIDAD_INVALIDA', `Cantidad inválida para ${l.producto}`);
    }
  }
  const total = lineas.reduce((suma, l) => suma + l.cantidad * l.precioUnitario, 0);
  if (total > montoMaximo) throw new ErrorDeDominio('MONTO_EXCEDIDO', `El total ${total} supera el máximo ${montoMaximo}`);
  return Object.freeze({ id, cliente, lineas, total, estado: 'CREADO' });
}
