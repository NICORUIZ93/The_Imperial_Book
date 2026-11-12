package academia.rutaflow.clean.domain;

public record Delivery(DeliveryId id, Destination destination, DeliveryStatus status) {
    public static Delivery create(DeliveryId id) {
        return new Delivery(id, null, DeliveryStatus.CREATED);
    }

    public Delivery assignTo(Destination nextDestination) {
        if (status != DeliveryStatus.CREATED) {
            throw new DeliveryAlreadyAssigned();
        }
        return new Delivery(id, nextDestination, DeliveryStatus.ASSIGNED);
    }

    public Delivery markDelivered() {
        if (status != DeliveryStatus.ASSIGNED) {
            throw new IllegalStateException("solo se entrega un envío asignado");
        }
        return new Delivery(id, destination, DeliveryStatus.DELIVERED);
    }
}
