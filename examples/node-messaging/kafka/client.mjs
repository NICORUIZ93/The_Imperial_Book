import { KafkaJS } from "@confluentinc/kafka-javascript";

export function createKafkaClient() {
  const brokers = (process.env.KAFKA_BOOTSTRAP_SERVERS ?? "localhost:19092")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (brokers.length === 0) throw new Error("KAFKA_BOOTSTRAP_SERVERS está vacío");
  return new KafkaJS.Kafka({ kafkaJS: { clientId: "rutaflow-node-lab", brokers } });
}
