package academia.mensajeria;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/** Declara la «tubería» en los dos brokers. Spring la crea al arrancar si no existe. */
@Configuration
class Topologia {

    static final String EXCHANGE = "pedidos";
    static final String RUTA = "pedido.creado";
    static final String COLA_FACTURACION = "facturacion.pedidos";
    static final String TOPIC = "pedidos";

    // RabbitMQ: el productor publica en un exchange; el binding copia el mensaje a la cola de cada interesado.
    @Bean
    DirectExchange exchangePedidos() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    Queue colaFacturacion() {
        return new Queue(COLA_FACTURACION, true);   // durable: sobrevive a un reinicio del broker
    }

    @Bean
    Binding facturacionEscuchaPedidos(Queue colaFacturacion, DirectExchange exchangePedidos) {
        return BindingBuilder.bind(colaFacturacion).to(exchangePedidos).with(RUTA);
    }

    // Kafka: un topic es un log particionado; los mensajes con la misma clave van a la misma partición (orden).
    @Bean
    NewTopic topicPedidos() {
        return TopicBuilder.name(TOPIC).partitions(3).replicas(1).build();
    }
}
