package academia.rutaflow.eventsourcing;

public sealed interface OrderEvent permits OrderEvent.OrderCreated, OrderEvent.OrderConfirmed,
        OrderEvent.OrderCancelled {
    String orderId();

    record OrderCreated(String orderId) implements OrderEvent {}
    record OrderConfirmed(String orderId) implements OrderEvent {}
    record OrderCancelled(String orderId, String reason) implements OrderEvent {}
}
