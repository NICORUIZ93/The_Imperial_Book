import { createKafkaClient } from "./client.mjs";

const producer = createKafkaClient().producer();
try {
  await producer.connect();
  const event = {
    eventId: crypto.randomUUID(),
    pedidoId: "p-17",
    estado: "DESPACHADO",
  };
  await producer.send({
    topic: process.env.KAFKA_TOPIC ?? "pedidos",
    messages: [{ key: event.pedidoId, value: JSON.stringify(event) }],
  });
  console.log(`publicado=${JSON.stringify(event)}`);
} finally {
  await producer.disconnect();
}
