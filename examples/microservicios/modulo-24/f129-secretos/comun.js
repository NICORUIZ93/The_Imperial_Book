// Módulo 20 · F129 · Piezas compartidas: una «base de datos» simulada que exige la clave vigente, y el nombre del secreto.
// (La base es falsa a propósito: la ficha trata de DÓNDE vive la clave, no de PostgreSQL.)
export const SECRETO_BD = 'tienda/bd'; // nombre lógico; cada proveedor lo traduce a su formato

export class ErrorDeAutenticacion extends Error {}

export function crearBaseDeDatos(claveInicial) {
  const estado = { clave: claveInicial };
  return {
    /** Lo que haría el DBA al rotar la clave. */
    rotar: (nueva) => { estado.clave = nueva; },
    consultar: (credenciales) => {
      if (credenciales.usuario !== 'app' || credenciales.clave !== estado.clave) throw new ErrorDeAutenticacion('password authentication failed for user "app"');
      return [{ pedido: 1, total: 120_000 }];
    },
  };
}
