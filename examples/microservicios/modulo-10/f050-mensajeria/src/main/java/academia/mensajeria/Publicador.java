package academia.mensajeria;

import java.util.concurrent.TimeUnit;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/** El servicio de pedidos publica «PedidoCreado» y sigue con su trabajo: no espera a Facturación. */
@Component
public class Publicador {

    private final RabbitTemplate rabbit;
    private final KafkaTemplate<String, String> kafka;

    Publicador(RabbitTemplate rabbit, KafkaTemplate<String, String> kafka) {
        this.rabbit = rabbit;
        this.kafka = kafka;
    }

    public void porRabbit(String pedidoId) {
        rabbit.convertAndSend(Topologia.EXCHANGE, Topologia.RUTA, "PedidoCreado:" + pedidoId);
    }

    /** La clave (pedidoId) decide la partición. get(...) espera la confirmación del broker (máx. 10 s). */
    public int porKafka(String pedidoId) throws Exception {
        var resultado = kafka.send(Topologia.TOPIC, pedidoId, "PedidoCreado:" + pedidoId).get(10, TimeUnit.SECONDS);
        return resultado.getRecordMetadata().partition();
    }
}
