package com.academia.rutaflow.event;

import java.util.concurrent.CompletableFuture;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import com.academia.rutaflow.config.KafkaConfiguration;

@Service
public class EnvioEventPublisher {
    private final KafkaTemplate<Object, Object> kafka;

    public EnvioEventPublisher(KafkaTemplate<Object, Object> kafka) {
        this.kafka = kafka;
    }

    public CompletableFuture<SendResult<Object, Object>> publicar(EnvioCreado evento) {
        return kafka.send(
                KafkaConfiguration.ENVIO_CREADO_TOPIC,
                evento.envioId().toString(),
                evento);
    }
}
