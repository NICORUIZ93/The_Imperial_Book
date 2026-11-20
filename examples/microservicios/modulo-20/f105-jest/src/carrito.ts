// Módulo 16 · F105 · Jest: lógica PURA (sin red, sin reloj, sin base de datos). Es lo más fácil y barato de probar.
// Requisitos: Node.js 26.13.1 LTS, jest 30.5.2, ts-jest 29.4.15, typescript 6.0.3.
export interface Item {
  sku: string;
  precio: number; // en la moneda base (COP), sin decimales
  cantidad: number;
}

export const CUPONES: Record<string, number> = { BIENVENIDA: 0.1, VIP: 0.2 };

export function calcularTotal(items: Item[], cupon?: string): number {
  if (items.length === 0) throw new RangeError('El carrito está vacío');
  for (const { sku, cantidad } of items) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) throw new RangeError(`Cantidad inválida para ${sku}`);
  }
  const subtotal = items.reduce((suma, { precio, cantidad }) => suma + precio * cantidad, 0);
  const descuento = cupon ? (CUPONES[cupon] ?? 0) : 0;
  return Math.round(subtotal * (1 - descuento));
}
