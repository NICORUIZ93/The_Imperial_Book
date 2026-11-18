package academia.rutaflow.eventsourcing;

import java.util.List;

public record OrderState(String orderId, Status status, String cancellationReason) {
    public enum Status { MISSING, CREATED, CONFIRMED, CANCELLED }

    public static OrderState empty() {
        return new OrderState(null, Status.MISSING, null);
    }

    public static OrderState replay(List<OrderEvent> events) {
        OrderState state = empty();
        for (OrderEvent event : events) {
            state = state.apply(event);
        }
        return state;
    }

    public OrderState apply(OrderEvent event) {
        if (event instanceof OrderEvent.OrderCreated created) {
            if (status != Status.MISSING) {
                throw new IllegalStateException("el pedido ya fue creado: " + created.orderId());
            }
            return new OrderState(created.orderId(), Status.CREATED, null);
        }

        if (!event.orderId().equals(orderId)) {
            throw new IllegalStateException("el evento pertenece a otro pedido: " + event.orderId());
        }
        if (event instanceof OrderEvent.OrderConfirmed) {
            if (status != Status.CREATED) {
                throw new IllegalStateException("solo se confirma un pedido recién creado");
            }
            return new OrderState(orderId, Status.CONFIRMED, null);
        }
        if (event instanceof OrderEvent.OrderCancelled cancelled) {
            if (status != Status.CONFIRMED) {
                throw new IllegalStateException("solo se cancela un pedido confirmado");
            }
            return new OrderState(orderId, Status.CANCELLED, cancelled.reason());
        }
        throw new IllegalStateException("evento no reconocido: " + event);
    }
}
