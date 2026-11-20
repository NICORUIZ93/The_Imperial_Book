// Módulo 26 · F157 · Versiones del esquema Avro del evento PedidoCreado (avsc 5.7.9).
import avro from 'avsc';

const base = { type: 'record', name: 'PedidoCreado', namespace: 'academia.pedidos' };
export const crudos = {
  v1: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'total', type: 'long' }] },
  // v2 bien: campo nuevo CON valor por defecto.
  v2: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'total', type: 'long' }, { name: 'moneda', type: 'string', default: 'COP' }] },
  // v2 mal: campo nuevo SIN valor por defecto.
  v2SinDefault: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'total', type: 'long' }, { name: 'moneda', type: 'string' }] },
  // v3: quita «total» (campo sin valor por defecto en v1).
  v3SinTotal: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'moneda', type: 'string', default: 'COP' }] },
};
export const tipos = Object.fromEntries(Object.entries(crudos).map(([k, v]) => [k, avro.Type.forSchema(v)]));

// ¿Puede un consumidor con el esquema `lector` leer datos escritos con `escritor`? (resolución de esquemas de Avro)
export function puedeLeer(lector, escritor) {
  try {
    lector.createResolver(escritor);
    return true;
  } catch {
    return false;
  }
}

// Reglas de Schema Registry entre la versión nueva y la anterior (modos no transitivos).
export function compatible(modo, nuevo, anterior) {
  const backward = puedeLeer(nuevo, anterior); // consumidores nuevos leen datos viejos
  const forward = puedeLeer(anterior, nuevo); // consumidores viejos leen datos nuevos
  return { BACKWARD: backward, FORWARD: forward, FULL: backward && forward, NONE: true }[modo];
}
