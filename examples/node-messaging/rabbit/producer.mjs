import amqp from "amqplib";
import { declareTopology } from "./topology.mjs";

const connection = await amqp.connect(process.env.AMQP_URL ?? "amqp://localhost");
try {
  const channel = await connection.createConfirmChannel();
  await declareTopology(channel);
  const event = { eventId: crypto.randomUUID(), pedidoId: "p-17", tipo: "GENERAR_ETIQUETA" };
  channel.publish("entregas", "label.ready", Buffer.from(JSON.stringify(event)), {
    contentType: "application/json",
    persistent: true,
    messageId: event.eventId,
  });
  await channel.waitForConfirms();
  console.log(`confirmado=${JSON.stringify(event)}`);
  await channel.close();
} finally {
  await connection.close();
}
