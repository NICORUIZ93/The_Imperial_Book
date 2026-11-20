// Verificación F107 (lado proveedor): npm run test:pact:proveedor   (después de test:pact:consumidor)
// Pact REPRODUCE contra la API real cada petición del contrato y compara las respuestas.
import path from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Verifier } from '@pact-foundation/pact';
import { crearApp, stock } from './app';

jest.setTimeout(30_000);

describe('inventario cumple los contratos de sus consumidores', () => {
  let servidor: Server;

  beforeAll((listo) => {
    servidor = crearApp(process.env.CAMPO_STOCK).listen(0, listo); // CAMPO_STOCK=cantidad simula el cambio que rompe
  });
  afterAll((listo) => {
    servidor.close(listo);
  });

  test('verifica el contrato de pedidos', async () => {
    const broker = process.env.PACT_BROKER_URL; // si está definido, los contratos se leen del Pact Broker
    const salida = await new Verifier({
      provider: 'inventario',
      providerBaseUrl: `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`,
      logLevel: 'warn',
      // De dónde salen los contratos: del archivo local o del Broker.
      ...(broker
        ? {
            pactBrokerUrl: broker,
            consumerVersionSelectors: [{ branch: 'main' }], // el contrato más reciente de la rama main de cada consumidor
            publishVerificationResult: true,
            providerVersion: process.env.VERSION_PROVEEDOR ?? '1.0.0',
            providerVersionBranch: 'main',
          }
        : { pactUrls: [path.resolve(__dirname, '..', 'pacts', 'pedidos-inventario.json')] }),
      // Cada `given(...)` del consumidor tiene aquí la función que deja al proveedor en ese estado.
      stateHandlers: {
        'existe el producto TEC-001 con 3 unidades': async () => {
          stock.clear();
          stock.set('TEC-001', 3);
        },
        'no existe el producto XXX-999': async () => {
          stock.clear();
        },
      },
    }).verifyProvider();
    expect(salida).toBeDefined();
  });
});
