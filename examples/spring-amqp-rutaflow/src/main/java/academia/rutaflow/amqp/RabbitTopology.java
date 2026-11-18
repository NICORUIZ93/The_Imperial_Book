package academia.rutaflow.amqp;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitTopology {
    public static final String EXCHANGE = "rutaflow.dispatch";
    public static final String QUEUE = "dispatch.requested";
    public static final String ROUTING_KEY = "dispatch.requested";
    public static final String DEAD_EXCHANGE = "rutaflow.dispatch.dlx";
    public static final String DEAD_QUEUE = "dispatch.rejected";
    public static final String DEAD_ROUTING_KEY = "dispatch.rejected";

    @Bean
    DirectExchange dispatchExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    @Bean
    DirectExchange dispatchDeadLetterExchange() {
        return new DirectExchange(DEAD_EXCHANGE, true, false);
    }

    @Bean
    Queue dispatchQueue() {
        return QueueBuilder.durable(QUEUE)
                .deadLetterExchange(DEAD_EXCHANGE)
                .deadLetterRoutingKey(DEAD_ROUTING_KEY)
                .build();
    }

    @Bean
    Queue dispatchRejectedQueue() {
        return QueueBuilder.durable(DEAD_QUEUE).build();
    }

    @Bean
    Binding dispatchBinding(Queue dispatchQueue, DirectExchange dispatchExchange) {
        return BindingBuilder.bind(dispatchQueue).to(dispatchExchange).with(ROUTING_KEY);
    }

    @Bean
    Binding rejectedBinding(Queue dispatchRejectedQueue, DirectExchange dispatchDeadLetterExchange) {
        return BindingBuilder.bind(dispatchRejectedQueue).to(dispatchDeadLetterExchange).with(DEAD_ROUTING_KEY);
    }
}
