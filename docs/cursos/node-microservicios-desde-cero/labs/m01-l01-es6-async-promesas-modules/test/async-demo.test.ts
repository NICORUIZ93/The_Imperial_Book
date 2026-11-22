import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchUser, loadUsers } from '../src/async-demo';

test('fetchUser resuelve usuario', async () => {
  const u = await fetchUser('7');
  assert.deepEqual(u, { id: '7', name: 'User-7' });
});

test('fetchUser rechaza id vacío', async () => {
  await assert.rejects(() => fetchUser(''), /id requerido/);
});

test('loadUsers usa Promise.all', async () => {
  const names = await loadUsers(['1', '2']);
  assert.deepEqual(names, ['User-1', 'User-2']);
});
