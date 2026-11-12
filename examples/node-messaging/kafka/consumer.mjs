import { createKafkaClient } from "./client.mjs";

const consumer = createKafkaClient().consumer({
  kafkaJS: { groupId: process.env.KAFKA_GROUP_ID ?? "proyeccion-pedidos", fromBeginning: true },
});
let stopping = false;
process.once("SIGINT", async () => {
  if (stopping) return;
  stopping = true;
  await consumer.disconnect();
  process.exitCode = 0;
});

try {
  await consumer.connect();
  await consumer.subscribe({ topics: [process.env.KAFKA_TOPIC ?? "pedidos"] });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(JSON.stringify({
        topic,
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        value: message.value?.toString(),
      }));
    },
  });
} catch (error) {
  console.error(error);
  process.exitCode = 1;
  await consumer.disconnect();
}
