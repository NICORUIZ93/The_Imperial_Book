package com.academia.rutaflow.consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.academia.rutaflow.config.KafkaConfiguration;
import com.academia.rutaflow.event.EnvioCreado;

@Component
public class RuteoListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(RuteoListener.class);
    private final RuteoService ruteoService;

    public RuteoListener(RuteoService ruteoService) {
        this.ruteoService = ruteoService;
    }

    @KafkaListener(
            topics = KafkaConfiguration.ENVIO_CREADO_TOPIC,
            groupId = "rutaflow-ruteo")
    public void alCrear(
            EnvioCreado evento,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        if (evento == null
                || evento.envioId() == null
                || !evento.envioId().toString().equals(key)) {
            throw new InvalidEventException("La key Kafka debe ser el envioId del evento");
        }
        boolean applied = ruteoService.procesar(evento);
        LOGGER.info(
                "Evento {} {}: key={}, partition={}, offset={}",
                evento.eventId(),
                applied ? "aplicado" : "duplicado ignorado",
                key,
                partition,
                offset);
    }
}
