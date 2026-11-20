// Contrato público de pagos: lo único que otros servicios pueden usar.
import { comision } from '../interno/tarifas.js';
export const cotizar = (valor) => ({ valor, comision: comision(valor) });
