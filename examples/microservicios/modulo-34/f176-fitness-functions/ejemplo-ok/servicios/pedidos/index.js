// pedidos usa SOLO la API pública de pagos.
import { cotizar } from '../pagos/api/cliente.js';
export const cerrarPedido = (total) => cotizar(total);
