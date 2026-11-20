package academia.dlt;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
class ManejoDeErrores {

    static final String COBROS = "cobros";
    /** Nombre por defecto en Spring for Apache Kafka 4.x: <topic>-dlt, MISMA partición que el original. */
    static final String COBROS_DLT = "cobros-dlt";

    @Bean
    NewTopic cobros() {
        return TopicBuilder.name(COBROS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic cobrosDlt() {
        // Al menos tantas particiones como el original: el recuperador publica en la misma partición.
        return TopicBuilder.name(COBROS_DLT).partitions(3).replicas(1).build();
    }

    /**
     * Boot conecta este CommonErrorHandler al contenedor de los @KafkaListener.
     * FixedBackOff(500 ms, 2): 1 intento + 2 reintentos. Al agotarse, el recuperador publica en cobros-dlt
     * (con cabeceras kafka_dlt-*) y el offset avanza: la partición NO se queda bloqueada.
     */
    @Bean
    DefaultErrorHandler manejadorDeErrores(KafkaTemplate<String, String> kafka) {
        var recuperador = new DeadLetterPublishingRecoverer(kafka);
        var manejador = new DefaultErrorHandler(recuperador, new FixedBackOff(500L, 2L));
        // Los errores permanentes van directo al DLT, sin reintentos.
        manejador.addNotRetryableExceptions(DatosInvalidos.class);
        return manejador;
    }
}
