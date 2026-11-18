package com.academia.rutaflow.outbox;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.kafka.common.KafkaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.academia.rutaflow.config.KafkaConfiguration;
import com.academia.rutaflow.event.EnvioCreado;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class OutboxDispatcher {
    private static final Logger LOGGER = LoggerFactory.getLogger(OutboxDispatcher.class);
    private static final int BATCH_SIZE = 20;
    private static final Duration LEASE_DURATION = Duration.ofSeconds(30);
    private static final long SEND_TIMEOUT_SECONDS = 5;

    private final OutboxRepository outbox;
    private final KafkaTemplate<Object, Object> kafka;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public OutboxDispatcher(
            OutboxRepository outbox,
            KafkaTemplate<Object, Object> kafka,
            ObjectMapper objectMapper,
            Clock clock) {
        this.outbox = outbox;
        this.kafka = kafka;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Scheduled(
            initialDelayString = "${rutaflow.outbox.initial-delay:1000}",
            fixedDelayString = "${rutaflow.outbox.fixed-delay:1000}")
    public void dispatch() {
        publishPendingBatch();
    }

    public int publishPendingBatch() {
        var now = clock.instant();
        var events = outbox.reclamarLote(BATCH_SIZE, now, now.plus(LEASE_DURATION));
        int published = 0;

        for (OutboxEvent event : events) {
            try {
                EnvioCreado payload = objectMapper.readValue(event.payload(), EnvioCreado.class);
                kafka.send(
                        KafkaConfiguration.ENVIO_CREADO_TOPIC,
                        event.aggregateId().toString(),
                        payload).get(SEND_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            } catch (InterruptedException exception) {
                outbox.programarReintento(event, clock.instant(), exception.toString());
                Thread.currentThread().interrupt();
                LOGGER.error("Interrumpida la publicación del outbox eventId={}", event.eventId(), exception);
                return published;
            } catch (ExecutionException | TimeoutException | JacksonException | KafkaException exception) {
                outbox.programarReintento(event, clock.instant(), exception.toString());
                LOGGER.error("Falló la publicación del outbox eventId={}; se reintentará", event.eventId(), exception);
                continue;
            }

            outbox.marcarPublicado(event.eventId(), clock.instant());
            published++;
        }
        return published;
    }
}
