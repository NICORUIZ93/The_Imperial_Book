// ERROR COMÚN F105 (variante): el «falso verde». Ejecuta: npx jest falso-verde --selectProjects errores
import { Cotizador } from '../src/cotizador';

const items = [{ sku: 'TEC-001', precio: 120000, cantidad: 1 }];
const cotizador = new Cotizador({ obtener: async () => 4000 }); // la tasa es VÁLIDA: cotizar no lanza

test('MAL: espera un error con try/catch; como no hay error, no se ejecuta ninguna aserción y sale en verde', async () => {
  try {
    await cotizador.cotizar(items, 'USD');
  } catch (error) {
    expect((error as Error).message).toBe('Tasa inválida para USD');
  }
});

test('BIEN: expect.assertions(1) exige que la aserción se ejecute', async () => {
  expect.assertions(1);
  try {
    await cotizador.cotizar(items, 'USD');
  } catch (error) {
    expect((error as Error).message).toBe('Tasa inválida para USD');
  }
});
