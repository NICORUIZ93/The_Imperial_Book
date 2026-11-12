package academia.rutaflow.amqp;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class DispatchPublisher {
    private final RabbitTemplate rabbitTemplate;

    public DispatchPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishAndConfirm(String trackingCode) throws Exception {
        CorrelationData correlation = new CorrelationData(UUID.randomUUID().toString());
        rabbitTemplate.convertAndSend(
                RabbitTopology.EXCHANGE, RabbitTopology.ROUTING_KEY, trackingCode, correlation);

        CorrelationData.Confirm confirm = correlation.getFuture().get(5, TimeUnit.SECONDS);
        if (!confirm.isAck()) {
            throw new IllegalStateException("RabbitMQ rechazó la publicación: " + confirm.getReason());
        }
        if (correlation.getReturned() != null) {
            throw new IllegalStateException("El mensaje no encontró una cola enlazada");
        }
        System.out.println("publicado y enrutado=" + trackingCode);
    }
}
