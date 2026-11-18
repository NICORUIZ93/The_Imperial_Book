package academia.rutaflow.event;

import java.util.concurrent.BlockingQueue;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
public class NotificacionListener {
    private final BlockingQueue<RuteoListener.Recibido> recibidos;

    public NotificacionListener(@Qualifier("eventosNotificaciones") BlockingQueue<RuteoListener.Recibido> recibidos) {
        this.recibidos = recibidos;
    }

    @KafkaListener(topics = EnvioEventPublisher.TOPIC, groupId = "rutaflow-notificaciones")
    public void alCrear(
            EnvioCreado evento,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        recibidos.add(new RuteoListener.Recibido(key, partition, offset, evento));
    }
}
