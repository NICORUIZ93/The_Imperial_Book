// pedidos se salta la API y lee la tarifa interna de pagos.
import { comision } from '../pagos/interno/tarifas.js';
import { cotizar } from '../pagos/api/cliente.js';
export const cerrarPedido = (total) => ({ ...cotizar(total), comisionDirecta: comision(total) });
