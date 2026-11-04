package academia.rutaflow.event;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import static org.awaitility.Awaitility.await;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import academia.rutaflow.inbox.InboxProcessor;
import academia.rutaflow.outbox.CrearEnvioService;
import academia.rutaflow.outbox.OutboxDispatcher;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.Map;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext
@EmbeddedKafka(partitions = 3, topics = {EnvioEventPublisher.TOPIC, EnvioEventPublisher.TOPIC + "-dlt"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class EnvioEventPublisherTest {
    @Autowired EnvioEventPublisher publisher;
    @Autowired @org.springframework.beans.factory.annotation.Qualifier("eventosRuteo")
    java.util.concurrent.BlockingQueue<RuteoListener.Recibido> recibidosRuteo;
    @Autowired @org.springframework.beans.factory.annotation.Qualifier("eventosNotificaciones")
    java.util.concurrent.BlockingQueue<RuteoListener.Recibido> recibidosNotificaciones;
    @Autowired RuteoListener ruteoListener;
    @Autowired EmbeddedKafkaBroker broker;
    @Autowired org.springframework.kafka.core.KafkaTemplate<String, EnvioCreado> kafka;
    @Autowired CrearEnvioService crearEnvio;
    @Autowired OutboxDispatcher outboxDispatcher;
    @Autowired InboxProcessor inbox;
    @Autowired JdbcTemplate jdbc;

    @Test
    void publicaConKeyDelEnvioYElListenerLaRecibe() throws Exception {
        recibidosRuteo.clear();
        recibidosNotificaciones.clear();
        UUID envioId = UUID.randomUUID();
        var evento = new EnvioCreado(UUID.randomUUID(), envioId, 1, Instant.parse("2026-01-01T00:00:00Z"), "RT-1");

        var metadata = publisher.publicar(evento).get(10, TimeUnit.SECONDS).getRecordMetadata();
        var recibido = recibidosRuteo.poll(10, TimeUnit.SECONDS);
        var notificacion = recibidosNotificaciones.poll(10, TimeUnit.SECONDS);

        assertThat(metadata.topic()).isEqualTo(EnvioEventPublisher.TOPIC);
        assertThat(metadata.partition()).isBetween(0, 2);
        assertThat(recibido).isNotNull();
        assertThat(recibido.key()).isEqualTo(envioId.toString());
        assertThat(recibido.partition()).isEqualTo(metadata.partition());
        assertThat(recibido.offset()).isEqualTo(metadata.offset());
        assertThat(recibido.evento()).isEqualTo(evento);
        assertThat(notificacion).isNotNull();
        assertThat(notificacion.partition()).isEqualTo(metadata.partition());
        assertThat(notificacion.offset()).isEqualTo(metadata.offset());
        assertThat(notificacion.evento()).isEqualTo(evento);
    }

    @Test
    void conservaParticionYOrdenParaDosEventosDelMismoEnvio() throws Exception {
        recibidosRuteo.clear();
        UUID envioId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        var primerEvento = new EnvioCreado(UUID.fromString("00000000-0000-0000-0000-000000000001"), envioId, 1,
                Instant.parse("2026-01-01T00:00:00Z"), "RT-1");
        var segundoEvento = new EnvioCreado(UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff"), envioId, 2,
                Instant.parse("2026-01-01T00:01:00Z"), "RT-1");

        var primero = publisher.publicar(primerEvento).get(10, TimeUnit.SECONDS).getRecordMetadata();
        var segundo = publisher.publicar(segundoEvento).get(10, TimeUnit.SECONDS).getRecordMetadata();
        var recibidoPrimero = recibidosRuteo.poll(10, TimeUnit.SECONDS);
        var recibidoSegundo = recibidosRuteo.poll(10, TimeUnit.SECONDS);

        assertThat(primero.partition()).isEqualTo(segundo.partition());
        assertThat(segundo.offset()).isGreaterThan(primero.offset());
        assertThat(recibidoPrimero.evento()).isEqualTo(primerEvento);
        assertThat(recibidoSegundo.evento()).isEqualTo(segundoEvento);
    }

    @Test
    void reintentaYPublicaEnDltCuandoLaKeyNoCoincide() throws Exception {
        ruteoListener.reiniciarIntentos();
        UUID envioId = UUID.randomUUID();
        var evento = new EnvioCreado(UUID.randomUUID(), envioId, 1,
                Instant.parse("2026-01-01T00:00:00Z"), "RT-DLT");
        Map<String, Object> props = KafkaTestUtils.consumerProps(broker, "verificador-dlt", false);
        props.put("auto.offset.reset", "earliest");

        try (Consumer<String, String> consumer = new KafkaConsumer<>(props,
                new StringDeserializer(), new StringDeserializer())) {
            broker.consumeFromAnEmbeddedTopic(consumer, EnvioEventPublisher.TOPIC + "-dlt");
            kafka.send(EnvioEventPublisher.TOPIC, "key-incorrecta", evento).get(10, TimeUnit.SECONDS);
            await().atMost(Duration.ofSeconds(5))
                    .untilAsserted(() -> assertThat(ruteoListener.intentos()).isEqualTo(3));
            ConsumerRecord<String, String> deadLetter = KafkaTestUtils.getSingleRecord(
                    consumer, EnvioEventPublisher.TOPIC + "-dlt", Duration.ofSeconds(10));

            assertThat(deadLetter.value()).contains("RT-DLT");
            assertThat(ruteoListener.intentos()).isEqualTo(3);
        }
    }

    @Test
    void guardaEnvioYOutboxEnLaMismaTransaccion() {
        jdbc.execute("ALTER TABLE outbox_event ADD CONSTRAINT fail_outbox_insert "
                + "CHECK (event_type <> 'EnvioCreado' OR payload NOT LIKE '%RT-ROLLBACK%')");
        try {
            assertThatThrownBy(() -> crearEnvio.crear("RT-ROLLBACK"))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        } finally {
            jdbc.execute("ALTER TABLE outbox_event DROP CONSTRAINT fail_outbox_insert");
        }

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM envio WHERE referencia = ?",
                Integer.class, "RT-ROLLBACK")).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM outbox_event WHERE payload LIKE ?",
                Integer.class, "%RT-ROLLBACK%")).isZero();
    }

    @Test
    void dispatcherPublicaYMarcaSoloDespuesDelAck() throws Exception {
        var evento = crearEnvio.crear("RT-OUTBOX");

        assertThat(outboxDispatcher.publicarPendientes()).isGreaterThanOrEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT published_at IS NOT NULL FROM outbox_event WHERE event_id = ?",
                Boolean.class, evento.eventId())).isTrue();
    }

    @Test
    void inboxHaceIdempotenteElEfectoDeNegocio() {
        UUID envioId = UUID.randomUUID();
        var evento = new EnvioCreado(UUID.randomUUID(), envioId, 1,
                Instant.parse("2026-01-01T00:00:00Z"), "RT-INBOX");

        assertThat(inbox.procesar(evento)).isTrue();
        assertThat(inbox.procesar(evento)).isFalse();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM evento_procesado WHERE event_id = ?",
                Integer.class, evento.eventId())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?",
                Integer.class, envioId)).isEqualTo(1);
    }

    @Test
    void revierteInboxYProyeccionJuntasCuandoLaActualizacionFalla() {
        UUID envioId = UUID.randomUUID();
        var evento = new EnvioCreado(UUID.randomUUID(), envioId, 1,
                Instant.parse("2026-01-01T00:00:00Z"), "RT-INBOX-ROLLBACK");
        jdbc.execute("ALTER TABLE route_projection ADD CONSTRAINT fail_projection_insert "
                + "CHECK (referencia <> 'RT-INBOX-ROLLBACK')");
        try {
            assertThatThrownBy(() -> inbox.procesar(evento))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        } finally {
            jdbc.execute("ALTER TABLE route_projection DROP CONSTRAINT fail_projection_insert");
        }

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM evento_procesado WHERE event_id = ?",
                Integer.class, evento.eventId())).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?",
                Integer.class, envioId)).isZero();
        assertThat(inbox.procesar(evento)).isTrue();
    }

    @Test
    void replayTrasAckConservaUnaSolaProyeccion() throws Exception {
        recibidosRuteo.clear();
        var evento = crearEnvio.crear("RT-REPLAY");
        assertThat(outboxDispatcher.publicarPendientes()).isGreaterThanOrEqualTo(1);
        jdbc.update("UPDATE outbox_event SET published_at = NULL WHERE event_id = ?", evento.eventId());

        assertThat(outboxDispatcher.publicarPendientes()).isGreaterThanOrEqualTo(1);
        await().atMost(Duration.ofSeconds(5)).untilAsserted(
                () -> assertThat(recibidosRuteo.size()).isGreaterThanOrEqualTo(2));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM evento_procesado WHERE event_id = ?",
                Integer.class, evento.eventId())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM route_projection WHERE envio_id = ?",
                Integer.class, evento.envioId())).isEqualTo(1);
    }
}
