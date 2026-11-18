package academia.rutaflow.streams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.Grouped;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Materialized;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.TimeWindows;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafkaStreams;

import java.time.Duration;

@Configuration(proxyBeanMethods = false)
@EnableKafkaStreams
public class PedidosTopology {
    public static final String INPUT = "pedidos";
    public static final String OUTPUT = "pedidos-despachados";
    public static final String COUNTS = "conteos-despachados-por-minuto";

    @Bean
    KStream<String, String> pedidosDespachados(StreamsBuilder builder) {
        KStream<String, String> input = builder.stream(
                INPUT, Consumed.with(Serdes.String(), Serdes.String()));
        KStream<String, String> dispatched = input
                .filter((pedidoId, estado) -> "DESPACHADO".equals(estado));
        dispatched.to(OUTPUT, Produced.with(Serdes.String(), Serdes.String()));

        dispatched
                .groupBy((pedidoId, estado) -> estado,
                        Grouped.with(Serdes.String(), Serdes.String()))
                .windowedBy(TimeWindows.ofSizeAndGrace(Duration.ofMinutes(1), Duration.ofSeconds(10)))
                .count(Materialized.as("conteo-despachados-por-minuto"))
                .toStream()
                .map((window, count) -> KeyValue.pair(
                        window.key() + "@" + window.window().start(), count))
                .to(COUNTS, Produced.with(Serdes.String(), Serdes.Long()));
        return dispatched;
    }
}
