package academia.rabbit;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.amqp.core.ReturnedMessage;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class Publicador {

    /** ack = el broker se hizo responsable; devuelto != null = no había ninguna cola para esa ruta. */
    public record Resultado(boolean ack, ReturnedMessage devuelto) {
    }

    private final RabbitTemplate rabbit;

    Publicador(RabbitTemplate rabbit) {
        this.rabbit = rabbit;
    }

    public Resultado publicar(String ruta, String cuerpo) throws Exception {
        var correlacion = new CorrelationData(UUID.randomUUID().toString());
        rabbit.convertAndSend(Topologia.EXCHANGE, ruta, cuerpo, correlacion);
        // Espera la confirmación del broker. En producción no bloquees por mensaje: usa whenComplete(...)
        // o publica en lotes y espera las confirmaciones del lote.
        CorrelationData.Confirm confirmacion = correlacion.getFuture().get(5, TimeUnit.SECONDS);
        // Spring garantiza que getReturned() ya está relleno cuando llega el ack de un mensaje devuelto.
        return new Resultado(confirmacion.isAck(), correlacion.getReturned());
    }
}
