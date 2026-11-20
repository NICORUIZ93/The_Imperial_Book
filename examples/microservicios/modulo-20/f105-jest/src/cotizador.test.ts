// Verificación F105 (dobles de prueba): npx jest f105-jest/src/cotizador.test.ts --selectProjects unit
import { Cotizador, type ClienteDeTasas } from './cotizador';
import { enviarCorreo } from './notificador';

// jest.mock reemplaza TODO el módulo por funciones simuladas (jest.fn) antes de que cotizador.ts lo importe.
jest.mock('./notificador');
const enviarCorreoMock = jest.mocked(enviarCorreo);

const items = [{ sku: 'TEC-001', precio: 120000, cantidad: 1 }];

describe('Cotizador', () => {
  let tasas: jest.Mocked<ClienteDeTasas>;
  let cotizador: Cotizador;

  beforeEach(() => {
    // Un doble por test: ningún test hereda llamadas ni respuestas de otro.
    tasas = { obtener: jest.fn() };
    cotizador = new Cotizador(tasas);
    enviarCorreoMock.mockReset();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('convierte el total con la tasa del servicio (stub: respuesta preparada)', async () => {
    tasas.obtener.mockResolvedValue(4000); // 1 USD = 4000 COP
    await expect(cotizador.cotizar(items, 'USD')).resolves.toBe(30);
    expect(tasas.obtener).toHaveBeenCalledWith('USD'); // mock: además verificamos CÓMO lo llamaron
  });

  test('si el servicio de tasas falla, el error llega a quien llama', async () => {
    tasas.obtener.mockRejectedValue(new Error('503 del servicio de tasas'));
    await expect(cotizador.cotizar(items, 'USD')).rejects.toThrow('503 del servicio de tasas');
  });

  test('guarda la tasa 60 s: dos cotizaciones seguidas hacen UNA llamada (reloj falso)', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-19T10:00:00Z') });
    tasas.obtener.mockResolvedValueOnce(4000).mockResolvedValueOnce(5000);

    expect(await cotizador.cotizar(items, 'USD')).toBe(30);
    jest.advanceTimersByTime(59_000); // pasan 59 s: la tasa sigue vigente
    expect(await cotizador.cotizar(items, 'USD')).toBe(30);
    expect(tasas.obtener).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2_000); // 61 s: venció
    expect(await cotizador.cotizar(items, 'USD')).toBe(24);
    expect(tasas.obtener).toHaveBeenCalledTimes(2);
  });

  test('rechaza una tasa inválida y no la guarda', async () => {
    tasas.obtener.mockResolvedValueOnce(0).mockResolvedValueOnce(4000);
    await expect(cotizador.cotizar(items, 'USD')).rejects.toThrow('Tasa inválida para USD');
    await expect(cotizador.cotizar(items, 'USD')).resolves.toBe(30);
  });

  test('cotizarYAvisar envía el correo con el valor (módulo simulado con jest.mock)', async () => {
    tasas.obtener.mockResolvedValue(4000);
    await cotizador.cotizarYAvisar(items, 'USD', 'ana@correo.co');
    expect(enviarCorreoMock).toHaveBeenCalledTimes(1);
    expect(enviarCorreoMock).toHaveBeenCalledWith('ana@correo.co', 'Tu cotización: 30 USD');
  });

  test('jest.spyOn observa un método real sin reemplazarlo', async () => {
    tasas.obtener.mockResolvedValue(4000);
    const espia = jest.spyOn(Math, 'round');
    await cotizador.cotizar(items, 'USD');
    expect(espia).toHaveBeenCalled();
    espia.mockRestore();
  });
});
