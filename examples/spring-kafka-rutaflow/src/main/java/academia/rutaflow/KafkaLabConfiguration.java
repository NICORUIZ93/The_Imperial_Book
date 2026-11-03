package academia.rutaflow;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import academia.rutaflow.event.EnvioEventPublisher;
import academia.rutaflow.event.RuteoListener;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaLabConfiguration {
    @Bean
    NewTopic enviosCreados() {
        return TopicBuilder.name(EnvioEventPublisher.TOPIC).partitions(3).replicas(1).build();
    }

    @Bean("eventosRuteo")
    BlockingQueue<RuteoListener.Recibido> eventosRuteo() {
        return new LinkedBlockingQueue<>();
    }

    @Bean("eventosNotificaciones")
    BlockingQueue<RuteoListener.Recibido> eventosNotificaciones() {
        return new LinkedBlockingQueue<>();
    }
}
