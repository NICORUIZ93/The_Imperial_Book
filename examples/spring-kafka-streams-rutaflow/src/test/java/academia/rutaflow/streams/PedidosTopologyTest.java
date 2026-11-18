package academia.rutaflow.streams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.TestInputTopic;
import org.apache.kafka.streams.TestOutputTopic;
import org.apache.kafka.streams.TopologyTestDriver;
import org.apache.kafka.streams.StreamsBuilder;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class PedidosTopologyTest {
    @Test
    void filtraEstadosYConservaLaClaveEnLaSalida() {
        try (TopologyTestDriver driver = crearDriver()) {
            TestInputTopic<String, String> input = driver.createInputTopic(
                    PedidosTopology.INPUT, Serdes.String().serializer(), Serdes.String().serializer());
            TestOutputTopic<String, String> output = driver.createOutputTopic(
                    PedidosTopology.OUTPUT, Serdes.String().deserializer(), Serdes.String().deserializer());

            input.pipeInput("pedido-1", "PENDIENTE");
            input.pipeInput("pedido-2", "DESPACHADO");

            assertThat(output.readKeyValue())
                    .isEqualTo(new KeyValue<>("pedido-2", "DESPACHADO"));
            assertThat(output.isEmpty()).isTrue();
        }
    }

    @Test
    void actualizaConteoPorVentanaConTiempoControlado() {
        try (TopologyTestDriver driver = crearDriver()) {
            TestInputTopic<String, String> input = driver.createInputTopic(
                    PedidosTopology.INPUT, Serdes.String().serializer(), Serdes.String().serializer());
            TestOutputTopic<String, Long> counts = driver.createOutputTopic(
                    PedidosTopology.COUNTS, Serdes.String().deserializer(), Serdes.Long().deserializer());

            input.pipeInput("pedido-1", "DESPACHADO", java.time.Instant.parse("2026-01-01T00:00:00Z"));
            input.pipeInput("pedido-2", "DESPACHADO", java.time.Instant.parse("2026-01-01T00:00:20Z"));

            assertThat(counts.readKeyValue().value).isEqualTo(1L);
            assertThat(counts.readKeyValue().value).isEqualTo(2L);
            assertThat(counts.isEmpty()).isTrue();
        }
    }

    private TopologyTestDriver crearDriver() {
        StreamsBuilder builder = new StreamsBuilder();
        new PedidosTopology().pedidosDespachados(builder);

        Properties properties = new Properties();
        properties.put(StreamsConfig.APPLICATION_ID_CONFIG, "rutaflow-stream-test");
        properties.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "dummy:9092");
        properties.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);
        properties.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);
        properties.put("statestore.cache.max.bytes", 0);
        properties.put(StreamsConfig.STATE_DIR_CONFIG, "target/kafka-streams-test-state");
        return new TopologyTestDriver(builder.build(), properties);
    }
}
