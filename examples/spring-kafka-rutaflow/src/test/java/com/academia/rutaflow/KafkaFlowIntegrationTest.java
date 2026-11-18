package com.academia.rutaflow;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doAnswer;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.TimeUnit;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.academia.rutaflow.config.KafkaConfiguration;
import com.academia.rutaflow.consumer.RuteoService;
import com.academia.rutaflow.envio.CrearEnvioService;
import com.academia.rutaflow.event.EnvioCreado;
import com.academia.rutaflow.event.EnvioEventPublisher;
import com.academia.rutaflow.outbox.OutboxDispatcher;

@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(
        partitions = 3,
        topics = {
                KafkaConfiguration.ENVIO_CREADO_TOPIC,
                KafkaConfiguration.ENVIO_CREADO_DLT
        })
class KafkaFlowIntegrationTest {
    @Autowired
    private CrearEnvioService crearEnvioService;

    @Autowired
    private EnvioEventPublisher publisher;

    @Autowired
    private OutboxDispatcher dispatcher;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EmbeddedKafkaBroker embeddedKafka;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @MockitoSpyBean
    private RuteoService ruteoService;

    // Boot declara el bean con genéricos comodín; localizar el spy por nombre y tipo raw.
    @MockitoSpyBean(name = "kafkaTemplate")
    @SuppressWarnings("rawtypes")
    private org.springframework.kafka.core.KafkaTemplate kafka;

    @Test
    void failedPublishRemainsPendingAndCanRecover() {
        EnvioCreado event = crearEnvioService.crear("RF-BROKER-FAILURE");
        var failedSend = new java.util.concurrent.CompletableFuture<
                org.springframework.kafka.support.SendResult<Object, Object>>();
        failedSend.completeExceptionally(new IllegalStateException("broker indisponible simulado"));
        org.mockito.Mockito.doReturn(failedSend).doCallRealMethod().when(kafka)
                .send(KafkaConfiguration.ENVIO_CREADO_TOPIC, event.envioId().toString(), event);
        assertEquals(0, dispatcher.publishPendingBatch());
        assertEquals(1, count("SELECT COUNT(*) FROM outbox_event WHERE event_id = ? AND published_at IS NULL AND lease_until IS NULL AND attempts = 1 AND last_error IS NOT NULL", event.eventId()));
        // Adelantar solo la fecha del registro evita depender del reloj y de sleeps.
        jdbc.update("UPDATE outbox_event SET next_attempt_at = ? WHERE event_id = ?",
                java.sql.Timestamp.from(java.time.Instant.EPOCH), event.eventId());
        assertEquals(1, dispatcher.publishPendingBatch());
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() ->
                assertEquals(1, count("SELECT COUNT(*) FROM event_inbox WHERE event_id = ?", event.eventId())));
        assertEquals(1, count("SELECT COUNT(*) FROM outbox_event WHERE event_id = ? AND published_at IS NOT NULL AND attempts = 2", event.eventId()));
    }

    @BeforeEach
    void clearDatabase() {
        jdbc.update("DELETE FROM event_inbox");
        jdbc.update("DELETE FROM route_projection");
        jdbc.update("DELETE FROM outbox_event");
        jdbc.update("DELETE FROM envio");
    }

    @Test
    void shipmentAndOutboxRollBackTogether() {
        var createdEvent = new AtomicReference<EnvioCreado>();
        var transaction = new TransactionTemplate(transactionManager);

        assertThrows(IllegalStateException.class, () -> transaction.executeWithoutResult(status -> {
            createdEvent.set(crearEnvioService.crear("RF-ROLLBACK"));
            throw new IllegalStateException("fallo deliberado de la transacción");
        }));

        EnvioCreado event = createdEvent.get();
        assertEquals(0, count("SELECT COUNT(*) FROM envio WHERE envio_id = ?", event.envioId()));
        assertEquals(0, count("SELECT COUNT(*) FROM outbox_event WHERE event_id = ?", event.eventId()));
    }

    @Test
    void outboxPublishesWithAggregateKeyAndConsumerAppliesEffectOnce() throws Exception {
        EnvioCreado event = crearEnvioService.crear("RF-0001");
        try (Consumer<String, byte[]> observer = consumer("flow-observer-" + UUID.randomUUID())) {
            embeddedKafka.consumeFromAnEmbeddedTopic(observer, KafkaConfiguration.ENVIO_CREADO_TOPIC);

            assertEquals(1, dispatcher.publishPendingBatch());
            ConsumerRecord<String, byte[]> record = readRecord(
                    observer,
                    KafkaConfiguration.ENVIO_CREADO_TOPIC,
                    event.envioId().toString());
            assertEquals(event.envioId().toString(), record.key());
            assertTrue(new String(record.value(), StandardCharsets.UTF_8).contains(event.eventId().toString()));

            await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
                assertEquals(1, count("SELECT COUNT(*) FROM event_inbox WHERE event_id = ?", event.eventId()));
                assertEquals(1, count("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?", event.envioId()));
            });

            var duplicateResult = new AtomicReference<Boolean>();
            doAnswer(invocation -> {
                boolean applied = (boolean) invocation.callRealMethod();
                duplicateResult.set(applied);
                return applied;
            }).when(ruteoService).procesar(event);
            publisher.publicar(event).get(5, TimeUnit.SECONDS);
            await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
                assertEquals(Boolean.FALSE, duplicateResult.get(), "Esperar a procesar el duplicado real");
                assertEquals(1, count("SELECT COUNT(*) FROM event_inbox WHERE event_id = ?", event.eventId()));
                assertEquals(1, count("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?", event.envioId()));
            });
        }
    }

    @Test
    void projectionFailureRollsBackInboxAndAllowsRedelivery() {
        var event = new EnvioCreado(UUID.randomUUID(), UUID.randomUUID(), 1,
                java.time.Instant.now(), "x".repeat(121));
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,
                () -> ruteoService.procesar(event));
        assertEquals(0, count("SELECT COUNT(*) FROM event_inbox WHERE event_id = ?", event.eventId()));
        assertEquals(0, count("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?", event.envioId()));
        var repaired = new EnvioCreado(event.eventId(), event.envioId(), 1, event.occurredAt(), "RF-REPAIRED");
        assertTrue(ruteoService.procesar(repaired));
        assertFalse(ruteoService.procesar(repaired));
    }

    @Test
    void transientConsumerFailureRetriesAndThenCommits() throws Exception {
        EnvioCreado event = crearEnvioService.crear("RF-RETRY");
        var attempts = new AtomicInteger();
        doAnswer(invocation -> {
            if (attempts.getAndIncrement() == 0) {
                throw new IllegalStateException("fallo transitorio deliberado");
            }
            return invocation.callRealMethod();
        }).when(ruteoService).procesar(event);

        publisher.publicar(event).get(5, TimeUnit.SECONDS);

        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            assertEquals(1, count("SELECT COUNT(*) FROM event_inbox WHERE event_id = ?", event.eventId()));
            assertEquals(1, count("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?", event.envioId()));
        });
        assertEquals(2, attempts.get());
    }

    @Test
    void invalidEventIsRecoveredToDeadLetterTopic() throws Exception {
        try (Consumer<String, byte[]> dltConsumer = consumer("dlt-observer-" + UUID.randomUUID())) {
            embeddedKafka.consumeFromAnEmbeddedTopic(dltConsumer, KafkaConfiguration.ENVIO_CREADO_DLT);

            var invalid = new EnvioCreado(
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    1,
                    java.time.Instant.now(),
                    " ");
            publisher.publicar(invalid).get(5, TimeUnit.SECONDS);

            ConsumerRecord<String, byte[]> record =
                    readRecord(dltConsumer, KafkaConfiguration.ENVIO_CREADO_DLT, invalid.envioId().toString());
            String payload = new String(record.value(), StandardCharsets.UTF_8);
            assertTrue(payload.contains(invalid.eventId().toString()));
            assertEquals(0, count("SELECT COUNT(*) FROM event_inbox WHERE event_id = ?", invalid.eventId()));
        }
    }

    @Test
    void malformedJsonKeepsOriginalBytesInDlt() throws Exception {
        String key = UUID.randomUUID().toString();
        byte[] raw = "{broken-json".getBytes(StandardCharsets.UTF_8);
        try (var producer = new org.apache.kafka.clients.producer.KafkaProducer<String, byte[]>(
                Map.of("bootstrap.servers", embeddedKafka.getBrokersAsString()),
                new org.apache.kafka.common.serialization.StringSerializer(),
                new org.apache.kafka.common.serialization.ByteArraySerializer());
             var observer = consumer("malformed-" + key)) {
            embeddedKafka.consumeFromAnEmbeddedTopic(observer, KafkaConfiguration.ENVIO_CREADO_DLT);
            producer.send(new org.apache.kafka.clients.producer.ProducerRecord<>(
                    KafkaConfiguration.ENVIO_CREADO_TOPIC, key, raw)).get(5, TimeUnit.SECONDS);
            var record = readRecord(observer, KafkaConfiguration.ENVIO_CREADO_DLT, key);
            org.junit.jupiter.api.Assertions.assertArrayEquals(raw, record.value());
        }
    }

    private Consumer<String, byte[]> consumer(String groupId) {
        Map<String, Object> properties = KafkaTestUtils.consumerProps(embeddedKafka, groupId, false);
        return new KafkaConsumer<>(
                properties,
                new StringDeserializer(),
                new ByteArrayDeserializer());
    }

    private static ConsumerRecord<String, byte[]> readRecord(
            Consumer<String, byte[]> consumer,
            String topic,
            String expectedKey) {
        var deadline = System.nanoTime() + Duration.ofSeconds(10).toNanos();
        while (System.nanoTime() < deadline) {
            var records = consumer.poll(Duration.ofMillis(200));
            for (ConsumerRecord<String, byte[]> record : records.records(topic)) {
                if (expectedKey.equals(record.key())) {
                    return record;
                }
            }
        }
        throw new AssertionError("No se recibió un registro en " + topic);
    }

    private int count(String sql, UUID id) {
        Integer result = jdbc.queryForObject(sql, Integer.class, id);
        return result == null ? 0 : result;
    }
}
