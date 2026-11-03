package academia.rutaflow.event;

import java.util.concurrent.BlockingQueue;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class RuteoListener {
    private final BlockingQueue<Recibido> recibidos;

    public RuteoListener(@Qualifier("eventosRuteo") BlockingQueue<Recibido> recibidos) {
        this.recibidos = recibidos;
    }

    @KafkaListener(topics = EnvioEventPublisher.TOPIC, groupId = "rutaflow-ruteo")
    public void alCrear(
            EnvioCreado evento,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        if (!key.equals(evento.envioId().toString())) {
            throw new IllegalArgumentException("La key no corresponde al envío");
        }
        recibidos.add(new Recibido(key, partition, offset, evento));
    }

    public record Recibido(String key, int partition, long offset, EnvioCreado evento) {}
}
