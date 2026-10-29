import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';
import { startGateway } from './gateway.mjs';

test('HTTP publica y un cliente Socket.IO compatible recibe; rechaza duplicado y token', { timeout: 5000 }, async t => {
  const gateway = await startGateway();
  const socket = io(gateway.url, { transports: ['websocket'], auth: { token: 'solo-laboratorio' } });
  t.after(async () => { socket.disconnect(); await gateway.close(); });
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve); socket.once('connect_error', reject);
  });
  assert.deepEqual(await socket.timeout(1000).emitWithAck('seguir-envio', 'ENV-ajeno'), { ok: false });
  assert.deepEqual(await socket.timeout(1000).emitWithAck('seguir-envio', 'ENV-42'), { ok: true });
  const received = new Promise(resolve => socket.once('posicion', resolve));
  const send = auth => fetch(`${gateway.url}/posiciones/ENV-42`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify({ sequence: 1, latitude: 4.65, longitude: -74.08 }) });
  assert.equal((await send('Bearer solo-laboratorio')).status, 202);
  assert.deepEqual(await received, { shipmentId: 'ENV-42', schemaVersion: 1,
    sequence: 1, latitude: 4.65, longitude: -74.08 });
  assert.equal((await send('Bearer solo-laboratorio')).status, 409);
  assert.equal((await send('Bearer incorrecto')).status, 401);
});
