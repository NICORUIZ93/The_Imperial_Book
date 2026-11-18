import { createServer } from 'node:http';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';

const server = createServer((_req, res) => setTimeout(() => res.end('ok'), 20));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
try {
  for (const concurrency of [1, 4]) {
    let next = 0;
    const latencies = [];
    const started = performance.now();
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (next++ < 12) {
        const start = performance.now();
        const response = await fetch(url);
        assert.equal(await response.text(), 'ok');
        latencies.push(performance.now() - start);
      }
    }));
    const elapsed = performance.now() - started;
    latencies.sort((a, b) => a - b);
    assert.equal(latencies.length, 12);
    console.log(JSON.stringify({ concurrency, requests: latencies.length,
      p95Ms: Math.round(latencies[Math.ceil(.95 * latencies.length) - 1]),
      requestsPerSecond: Math.round(12 / (elapsed / 1000)) }));
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}
