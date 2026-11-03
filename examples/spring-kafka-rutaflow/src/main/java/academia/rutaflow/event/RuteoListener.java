package academia.rutaflow.event;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import academia.rutaflow.inbox.InboxProcessor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class RuteoListener {
    private final BlockingQueue<Recibido> recibidos;
    private final InboxProcessor inbox;
    private final AtomicInteger intentos = new AtomicInteger();

    public RuteoListener(@Qualifier("eventosRuteo") BlockingQueue<Recibido> recibidos,
            InboxProcessor inbox) {
        this.recibidos = recibidos;
        this.inbox = inbox;
    }

    @KafkaListener(topics = EnvioEventPublisher.TOPIC, groupId = "rutaflow-ruteo")
    public void alCrear(
            EnvioCreado evento,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        intentos.incrementAndGet();
        if (!key.equals(evento.envioId().toString())) {
            throw new IllegalStateException("La key no corresponde al envío");
        }
        inbox.procesar(evento);
        recibidos.add(new Recibido(key, partition, offset, evento));
    }

    public int intentos() {
        return intentos.get();
    }

    public void reiniciarIntentos() {
        intentos.set(0);
    }

    public record Recibido(String key, int partition, long offset, EnvioCreado evento) {}
}
