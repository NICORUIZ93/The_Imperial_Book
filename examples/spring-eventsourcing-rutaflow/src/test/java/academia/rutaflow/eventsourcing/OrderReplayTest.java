package academia.rutaflow.eventsourcing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class OrderReplayTest {
    @Autowired
    private OrderEventStore eventStore;

    @Test
    void eventStreamCanRebuildTheCurrentOrderWithoutSavingASnapshot() {
        String id = "replay-complete";
        eventStore.append(new OrderEvent.OrderCreated(id));
        eventStore.append(new OrderEvent.OrderConfirmed(id));
        eventStore.append(new OrderEvent.OrderCancelled(id, "cliente cambió de opinión"));

        List<OrderEvent> history = eventStore.load(id);
        OrderState rebuilt = OrderState.replay(history);

        assertThat(history).hasSize(3);
        assertThat(rebuilt).isEqualTo(new OrderState(id, OrderState.Status.CANCELLED,
            "cliente cambió de opinión"));
        assertThat(eventStore.currentState(id)).isEqualTo(rebuilt);
    }

    @Test
    void replayRejectsEventsStoredInAnImpossibleOrder() {
        List<OrderEvent> outOfOrder = List.of(
            new OrderEvent.OrderCreated("replay-invalid"),
            new OrderEvent.OrderCancelled("replay-invalid", "sin confirmar"),
            new OrderEvent.OrderConfirmed("replay-invalid"));

        assertThatThrownBy(() -> OrderState.replay(outOfOrder))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("solo se cancela un pedido confirmado");
    }

    @Test
    void anEmptyHistoryProducesNoOrder() {
        assertThat(OrderState.replay(List.of())).isEqualTo(OrderState.empty());
    }

    @Test
    void anInvalidEventIsNotAddedToTheStream() {
        String id = "replay-append-check";
        OrderEvent created = new OrderEvent.OrderCreated(id);
        eventStore.append(created);

        assertThatThrownBy(() -> eventStore.append(
            new OrderEvent.OrderCancelled(id, "no se confirmó")))
            .isInstanceOf(IllegalStateException.class);

        assertThat(eventStore.load(id)).containsExactly(created);
    }
}
