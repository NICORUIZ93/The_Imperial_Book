// Test del «Hola Mundo» de Node.js: arranca el servidor en un puerto libre y le hace un GET.
// Ejecuta (desde la carpeta node/):  node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from './servidor.js';

test('GET /hola responde 200 con el saludo', async () => {
  const servidor = crearServidor().listen(0);
  await new Promise((listo) => servidor.once('listening', listo));
  try {
    const r = await fetch(`http://localhost:${servidor.address().port}/hola`);
    assert.equal(r.status, 200);
    assert.equal(await r.text(), 'Hola Mundo desde Node.js\n');
  } finally {
    servidor.close();
  }
});
