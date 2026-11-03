package academia.rutaflow;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.time.Clock;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import academia.rutaflow.event.EnvioEventPublisher;
import academia.rutaflow.event.RuteoListener;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
public class KafkaLabConfiguration {
    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    NewTopic enviosCreados() {
        return TopicBuilder.name(EnvioEventPublisher.TOPIC).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic enviosCreadosDlt() {
        return TopicBuilder.name(EnvioEventPublisher.TOPIC + "-dlt").partitions(3).replicas(1).build();
    }

    @Bean
    DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> kafka) {
        var recoverer = new DeadLetterPublishingRecoverer(kafka);
        return new DefaultErrorHandler(recoverer, new FixedBackOff(100L, 2));
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
