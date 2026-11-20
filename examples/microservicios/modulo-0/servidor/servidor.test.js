// Test del servidor: lo enciende en un puerto libre (0 = "el que esté libre"),
// le hace dos pedidos y comprueba que responde y que sigue vivo entre pedidos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from './servidor.js';

test('el servidor responde y sigue esperando pedidos', async () => {
  const servidor = crearServidor().listen(0);
  await new Promise((listo) => servidor.once('listening', listo));
  const { port } = servidor.address();
  try {
    const r1 = await fetch(`http://localhost:${port}/`);
    assert.equal(r1.status, 200);
    assert.match(await r1.text(), /Hola, soy un servidor/);
    const r2 = await fetch(`http://localhost:${port}/otra-vez`);
    assert.match(await r2.text(), /2 vez/); // el mismo proceso atendió el segundo pedido
  } finally {
    servidor.close();
  }
});
