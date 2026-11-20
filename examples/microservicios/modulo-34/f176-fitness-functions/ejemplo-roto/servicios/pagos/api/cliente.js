// pagos ahora importa algo de pedidos → ciclo pedidos ↔ pagos.
import { comision } from '../interno/tarifas.js';
import { cerrarPedido } from '../../pedidos/index.js';
export const cotizar = (valor) => ({ valor, comision: comision(valor) });
export const reintentar = (total) => cerrarPedido(total);
