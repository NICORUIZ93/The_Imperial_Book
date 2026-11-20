// Verificación F105 (lógica pura): npx jest f105-jest/src/carrito.test.ts --selectProjects unit
import { calcularTotal, type Item } from './carrito';

const teclado: Item = { sku: 'TEC-001', precio: 120000, cantidad: 1 };
const mouse: Item = { sku: 'MOU-001', precio: 50000, cantidad: 2 };

describe('calcularTotal', () => {
  // Patrón AAA: Arrange (preparar), Act (ejecutar), Assert (comprobar).
  test('suma precio × cantidad de cada item', () => {
    const items = [teclado, mouse]; // Arrange
    const total = calcularTotal(items); // Act
    expect(total).toBe(220000); // Assert
  });

  // test.each: la misma prueba con una tabla de casos. Cada fila aparece como un test con su nombre.
  test.each([
    ['BIENVENIDA', 198000],
    ['VIP', 176000],
    ['NO-EXISTE', 220000],
    [undefined, 220000],
  ])('con el cupón %s el total es %i', (cupon, esperado) => {
    expect(calcularTotal([teclado, mouse], cupon)).toBe(esperado);
  });

  test('rechaza un carrito vacío', () => {
    // Para comprobar una excepción se pasa una FUNCIÓN: si llamaras calcularTotal([]) directamente, el error mataría al test.
    expect(() => calcularTotal([])).toThrow(RangeError);
    expect(() => calcularTotal([])).toThrow('El carrito está vacío');
  });

  test.each([0, -1, 1.5])('rechaza la cantidad %p', (cantidad) => {
    expect(() => calcularTotal([{ ...teclado, cantidad }])).toThrow('Cantidad inválida para TEC-001');
  });

  test('toBe compara identidad; toEqual compara contenido', () => {
    const copia = { ...teclado };
    expect(copia).not.toBe(teclado); // son dos objetos distintos
    expect(copia).toEqual(teclado); // con el mismo contenido
    expect(copia).toMatchObject({ sku: 'TEC-001' }); // «al menos estos campos»
    expect(0.1 + 0.2).toBeCloseTo(0.3); // decimales: nunca toBe
  });
});
