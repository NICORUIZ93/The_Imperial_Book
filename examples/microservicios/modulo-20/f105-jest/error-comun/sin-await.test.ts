// ERROR COMÚN F105: una aserción dentro de una promesa que nadie espera (falta await o return).
// Ejecuta: npx jest sin-await --selectProjects errores
import { Cotizador } from '../src/cotizador';

const items = [{ sku: 'TEC-001', precio: 120000, cantidad: 1 }];
const cotizador = new Cotizador({ obtener: async () => 4000 });

test('MAL: el test termina antes de que se ejecute la aserción', () => {
  cotizador.cotizar(items, 'USD').then((valor) => {
    expect(valor).toBe(999); // 30 no es 999, pero esto corre cuando el test YA terminó
  });
});
