package academia.rutaflow.amqp;

import java.io.IOException;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
public class DispatchListener {
    private final DispatchService dispatchService;

    public DispatchListener(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @RabbitListener(queues = RabbitTopology.QUEUE)
    public void receive(String trackingCode, Channel channel,
                        @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        try {
            dispatchService.createDispatch(trackingCode);
            channel.basicAck(deliveryTag, false);
        } catch (InvalidDispatchException permanentError) {
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
