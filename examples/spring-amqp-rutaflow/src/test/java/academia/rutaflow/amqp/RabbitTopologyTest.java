package academia.rutaflow.amqp;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;

class RabbitTopologyTest {
    private final RabbitTopology topology = new RabbitTopology();

    @Test
    void colaPrincipalEsDurableYEnvíaFallosFinalesALaDlx() {
        Queue queue = topology.dispatchQueue();

        assertThat(queue.getName()).isEqualTo(RabbitTopology.QUEUE);
        assertThat(queue.isDurable()).isTrue();
        assertThat(queue.getArguments())
                .containsEntry("x-dead-letter-exchange", RabbitTopology.DEAD_EXCHANGE)
                .containsEntry("x-dead-letter-routing-key", RabbitTopology.DEAD_ROUTING_KEY);
    }

    @Test
    void bindingDeTrabajoYBindingDeDeadLetterUsanSusClaves() {
        Binding work = topology.dispatchBinding(topology.dispatchQueue(), topology.dispatchExchange());
        Binding dead = topology.rejectedBinding(
                topology.dispatchRejectedQueue(), topology.dispatchDeadLetterExchange());

        assertThat(work.getDestination()).isEqualTo(RabbitTopology.QUEUE);
        assertThat(work.getRoutingKey()).isEqualTo("dispatch.requested");
        assertThat(dead.getDestination()).isEqualTo(RabbitTopology.DEAD_QUEUE);
        assertThat(dead.getRoutingKey()).isEqualTo(RabbitTopology.DEAD_ROUTING_KEY);
    }
}
