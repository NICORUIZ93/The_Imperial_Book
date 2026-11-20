package academia.rabbit;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * pedidos (exchange) --pedido.creado--> pedidos (quorum queue)
 *                                          | rechazado sin requeue o delivery-limit superado
 *                                          v
 *                          pedidos.dlx (exchange) --muertos--> pedidos.dlq
 */
@Configuration
class Topologia {

    static final String EXCHANGE = "pedidos";
    static final String RUTA = "pedido.creado";
    static final String COLA = "pedidos";
    static final String DLX = "pedidos.dlx";
    static final String DLQ = "pedidos.dlq";

    @Bean
    DirectExchange pedidos() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    Queue colaPedidos() {
        return QueueBuilder.durable(COLA)
                .quorum()                         // replicada con Raft; el tipo recomendado para datos importantes
                .deadLetterExchange(DLX)          // a dónde van los mensajes muertos
                .deadLetterRoutingKey("muertos")
                .deliveryLimit(3)                 // tras 3 entregas fallidas más, se da por muerto (por defecto 20)
                .build();
    }

    @Bean
    Binding pedidosACola(Queue colaPedidos, DirectExchange pedidos) {
        return BindingBuilder.bind(colaPedidos).to(pedidos).with(RUTA);
    }

    @Bean
    DirectExchange exchangeMuertos() {
        return new DirectExchange(DLX);
    }

    @Bean
    Queue colaMuertos() {
        return QueueBuilder.durable(DLQ).quorum().build();
    }

    @Bean
    Binding muertosACola(Queue colaMuertos, DirectExchange exchangeMuertos) {
        return BindingBuilder.bind(colaMuertos).to(exchangeMuertos).with("muertos");
    }
}
