package academia.rutaflow.avro;

import io.confluent.kafka.schemaregistry.testutil.MockSchemaRegistry;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SchemaRegistrySerdeTest {
    @Test
    void serdeRegistraYRecuperaEsquemaUsandoRegistryMock() throws Exception {
        String scope = "rutaflow-" + UUID.randomUUID();
        String registry = "mock://" + scope;
        Schema schema = new Schema.Parser().parse(Path.of(
                "src/main/avro/PedidoDespachado-v1.avsc").toFile());
        GenericRecord record = new GenericData.Record(schema);
        record.put("pedidoId", "pedido-7");
        record.put("estado", "DESPACHADO");
        Map<String, Object> config = Map.of("schema.registry.url", registry);

        try {
            KafkaAvroSerializer serializer = new KafkaAvroSerializer();
            KafkaAvroDeserializer deserializer = new KafkaAvroDeserializer();
            serializer.configure(config, false);
            deserializer.configure(config, false);
            byte[] wireRecord = serializer.serialize("pedidos", record);
            GenericRecord read = (GenericRecord) deserializer.deserialize("pedidos", wireRecord);

            assertThat(read.get("pedidoId").toString()).isEqualTo("pedido-7");
            assertThat(read.get("estado").toString()).isEqualTo("DESPACHADO");
            assertThat(wireRecord).startsWith((byte) 0);
            serializer.close();
            deserializer.close();
        } finally {
            MockSchemaRegistry.dropScope(scope);
        }
    }
}
