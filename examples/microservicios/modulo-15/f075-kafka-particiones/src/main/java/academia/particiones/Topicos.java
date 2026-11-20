package academia.particiones;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/** KafkaAdmin (auto-configurado por Boot) crea el topic al arrancar si no existe. */
@Configuration
class Topicos {

    static final String PEDIDOS = "pedidos-particionados";

    @Bean
    NewTopic pedidosParticionados() {
        // 3 particiones = como máximo 3 consumidores trabajando en paralelo dentro de un grupo.
        // 1 réplica porque el laboratorio tiene un solo broker; en producción, 3 réplicas y min.insync.replicas=2.
        return TopicBuilder.name(PEDIDOS).partitions(3).replicas(1).build();
    }
}
