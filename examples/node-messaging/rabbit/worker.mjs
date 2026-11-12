import amqp from "amqplib";
import { declareTopology } from "./topology.mjs";

// Solo demuestra duplicados dentro de este proceso. Sustituye este Set por una
// tabla inbox con event_id UNIQUE para que sobreviva reinicios y varias réplicas.
const processedInThisProcess = new Set();
const connection = await amqp.connect(process.env.AMQP_URL ?? "amqp://localhost");
const channel = await connection.createChannel();
await declareTopology(channel);
await channel.prefetch(5);
await channel.consume("envios", async (message) => {
  if (!message) return;
  try {
    const event = JSON.parse(message.content.toString());
    if (typeof event.eventId !== "string" || event.eventId.length === 0) {
      channel.nack(message, false, false);
      return;
    }
    if (processedInThisProcess.has(event.eventId)) {
      console.log(`duplicado=${event.eventId}`);
    } else {
      console.log(`procesado=${JSON.stringify(event)}`);
      processedInThisProcess.add(event.eventId);
    }
    channel.ack(message);
  } catch (error) {
    console.error("mensaje inválido; enviado a DLQ", error.message);
    channel.nack(message, false, false);
  }
}, { noAck: false });

async function shutdown() {
  await channel.close();
  await connection.close();
}
process.once("SIGINT", () => { void shutdown(); });
process.once("SIGTERM", () => { void shutdown(); });
