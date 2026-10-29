import assert from 'node:assert/strict';
import { abVariant, serveWithShadow } from './deployment.mjs';

assert.equal(abVariant('ENV-42', 0), 'stable');
assert.equal(abVariant('ENV-42', 1), 'canary');
assert.equal(abVariant('ENV-42'), abVariant('ENV-42'));

const calls = [];
const response = await serveWithShadow({
  request: { id: 'ENV-42' },
  stable: async request => {
    calls.push(`stable:${request.id}`);
    return { status: 200, source: 'stable' };
  },
  shadow: async request => {
    calls.push(`shadow:${request.id}`);
    return { status: 500, source: 'shadow' };
  },
});
assert.deepEqual(response, { status: 200, source: 'stable' });
assert.deepEqual(calls.sort(), ['shadow:ENV-42', 'stable:ENV-42']);
console.log('deployment strategies: ok');
