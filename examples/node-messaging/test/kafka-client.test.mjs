import test from "node:test";
import assert from "node:assert/strict";
import { createKafkaClient } from "../kafka/client.mjs";

test("crea productor y consumidor sin conectarse al broker", () => {
  const kafka = createKafkaClient();
  assert.equal(typeof kafka.producer, "function");
  assert.equal(typeof kafka.consumer, "function");
});
