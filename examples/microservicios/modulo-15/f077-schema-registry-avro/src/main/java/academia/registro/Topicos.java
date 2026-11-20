package academia.registro;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
class Topicos {

    /** Con TopicNameStrategy (la estrategia por defecto) el subject del valor se llama «pedidos-avro-value». */
    static final String PEDIDOS = "pedidos-avro";

    @Bean
    NewTopic pedidosAvro() {
        return TopicBuilder.name(PEDIDOS).partitions(3).replicas(1).build();
    }
}
