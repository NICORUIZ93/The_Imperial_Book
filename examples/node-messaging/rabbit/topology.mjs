export async function declareTopology(channel) {
  await channel.assertExchange("entregas", "direct", { durable: true });
  await channel.assertExchange("entregas.dlx", "direct", { durable: true });
  await channel.assertQueue("envios", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "entregas.dlx",
      "x-dead-letter-routing-key": "dead",
    },
  });
  await channel.assertQueue("envios.dlq", { durable: true });
  await channel.bindQueue("envios", "entregas", "label.ready");
  await channel.bindQueue("envios.dlq", "entregas.dlx", "dead");
}
