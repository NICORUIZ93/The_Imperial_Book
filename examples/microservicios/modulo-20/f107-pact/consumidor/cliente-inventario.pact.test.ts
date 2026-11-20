// Verificación F107 (lado consumidor): npm run test:pact:consumidor
// Pact levanta un servidor FALSO de inventario; el cliente real le habla; si todo coincide, escribe el contrato en pacts/.
import path from 'node:path';
import { Pact, Matchers } from '@pact-foundation/pact';
import { ClienteInventario } from './cliente-inventario';

const { like, integer } = Matchers;

const pact = new Pact({
  consumer: 'pedidos',
  provider: 'inventario',
  dir: path.resolve(__dirname, '..', 'pacts'), // → f107-pact/pacts/pedidos-inventario.json
  logLevel: 'warn',
});

describe('contrato pedidos → inventario', () => {
  test('GET /stock/:sku de un producto que existe', async () => {
    await pact
      .addInteraction()
      .given('existe el producto TEC-001 con 3 unidades') // ESTADO que el proveedor deberá preparar
      .uponReceiving('una consulta de stock de TEC-001')
      .withRequest('GET', '/stock/TEC-001', (peticion) => {
        peticion.headers({ accept: 'application/json' });
      })
      .willRespondWith(200, (respuesta) => {
        // jsonBody añade Content-Type: application/json. Matchers: el contrato exige el TIPO (texto, entero), no estos valores.
        respuesta.jsonBody({ sku: like('TEC-001'), disponible: integer(3) });
      })
      .executeTest(async (servidorFalso) => {
        const cliente = new ClienteInventario(servidorFalso.url);
        await expect(cliente.obtenerStock('TEC-001')).resolves.toEqual({ sku: 'TEC-001', disponible: 3 });
        // (una sola petición por interacción: el servidor falso exige que cada una ocurra exactamente una vez)
      });
  });

  test('GET /stock/:sku de un producto que no existe', async () => {
    await pact
      .addInteraction()
      .given('no existe el producto XXX-999')
      .uponReceiving('una consulta de stock de XXX-999')
      .withRequest('GET', '/stock/XXX-999')
      .willRespondWith(404)
      .executeTest(async (servidorFalso) => {
        const cliente = new ClienteInventario(servidorFalso.url);
        await expect(cliente.obtenerStock('XXX-999')).resolves.toBeNull();
      });
  });
});
