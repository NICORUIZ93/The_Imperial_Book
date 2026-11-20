package academia.eos;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
class Topicos {

    static final String PAGOS = "pagos";
    static final String VALIDADOS = "pagos-validados";

    @Bean
    NewTopic pagos() {
        return TopicBuilder.name(PAGOS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic validados() {
        return TopicBuilder.name(VALIDADOS).partitions(3).replicas(1).build();
    }
}
