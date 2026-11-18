package com.academia.rutaflow.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

import com.academia.rutaflow.consumer.InvalidEventException;

@Configuration
public class KafkaConfiguration {
    public static final String ENVIO_CREADO_TOPIC = "rutaflow.envio.creado";
    public static final String ENVIO_CREADO_DLT = ENVIO_CREADO_TOPIC + ".DLT";

    @Bean
    NewTopic envioCreadoTopic() {
        return TopicBuilder.name(ENVIO_CREADO_TOPIC).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic envioCreadoDlt() {
        return TopicBuilder.name(ENVIO_CREADO_DLT).partitions(3).replicas(1).build();
    }

    @Bean
    DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<Object, Object> kafka) {
        var recoverer = new DeadLetterPublishingRecoverer(
                kafka, (record, exception) ->
                        new TopicPartition(ENVIO_CREADO_DLT, record.partition()));
        // No confirmar recuperación si el broker rechaza la publicación a DLT.
        recoverer.setFailIfSendResultIsError(true);
        var handler = new DefaultErrorHandler(recoverer, new FixedBackOff(1_000L, 2L));
        handler.addNotRetryableExceptions(InvalidEventException.class);
        return handler;
    }
}
