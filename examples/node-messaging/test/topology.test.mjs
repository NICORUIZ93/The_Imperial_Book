import test from "node:test";
import assert from "node:assert/strict";
import { declareTopology } from "../rabbit/topology.mjs";

test("declara exchange, cola de trabajo y DLQ con claves correspondientes", async () => {
  const calls = [];
  const channel = Object.fromEntries([
    "assertExchange", "assertQueue", "bindQueue",
  ].map((name) => [name, async (...args) => calls.push([name, ...args])]));

  await declareTopology(channel);

  assert.deepEqual(calls, [
    ["assertExchange", "entregas", "direct", { durable: true }],
    ["assertExchange", "entregas.dlx", "direct", { durable: true }],
    ["assertQueue", "envios", { durable: true, arguments: {
      "x-dead-letter-exchange": "entregas.dlx",
      "x-dead-letter-routing-key": "dead",
    } }],
    ["assertQueue", "envios.dlq", { durable: true }],
    ["bindQueue", "envios", "entregas", "label.ready"],
    ["bindQueue", "envios.dlq", "entregas.dlx", "dead"],
  ]);
});
