import test from 'node:test';
import assert from 'node:assert/strict';
import { captureOrder } from '../src/event-loop';

test('orden respeta sync, microtasks y macrotasks', async () => {
  const order = await captureOrder();
  assert.deepEqual(order.slice(0,2), ['sync-start','sync-end']);
  assert.equal(order[2], 'microtask-nextTick');
  assert.equal(order[3], 'microtask-promise');
  assert.ok(order.includes('macrotask-timeout'));
  assert.ok(order.includes('macrotask-immediate'));
  assert.ok(order.indexOf('microtask-promise') < order.indexOf('macrotask-timeout'));
});
