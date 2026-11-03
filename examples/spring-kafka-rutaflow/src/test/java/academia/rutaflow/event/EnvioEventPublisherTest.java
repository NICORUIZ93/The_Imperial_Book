package academia.rutaflow.event;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;

@SpringBootTest
@EmbeddedKafka(partitions = 3, topics = EnvioEventPublisher.TOPIC,
        bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class EnvioEventPublisherTest {
    @Autowired EnvioEventPublisher publisher;
    @Autowired @org.springframework.beans.factory.annotation.Qualifier("eventosRuteo")
    java.util.concurrent.BlockingQueue<RuteoListener.Recibido> recibidosRuteo;
    @Autowired @org.springframework.beans.factory.annotation.Qualifier("eventosNotificaciones")
    java.util.concurrent.BlockingQueue<RuteoListener.Recibido> recibidosNotificaciones;

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
}
