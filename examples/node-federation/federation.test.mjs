import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startFederation } from './server.mjs';
test('compone dos subgrafos y maneja pedido inexistente', async () => {
  const lab = await startFederation();
  try {
    const query = async (id) => {
      const response = await fetch(lab.url, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'query($id: ID!) { pedido(id: $id) { conductor { nombre pedidosActivos } } }', variables: { id } }) });
      return response.json();
    };
    assert.deepEqual(await query('p-1'), { data: { pedido: { conductor: { nombre: 'Ana', pedidosActivos: 1 } } } });
    assert.deepEqual(await query('ausente'), { data: { pedido: null } });
  } finally { await lab.close(); }
});
