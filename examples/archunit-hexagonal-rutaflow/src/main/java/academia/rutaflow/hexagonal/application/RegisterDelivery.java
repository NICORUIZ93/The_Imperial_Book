package academia.rutaflow.hexagonal.application;

import academia.rutaflow.hexagonal.domain.Delivery;
import academia.rutaflow.hexagonal.domain.DeliveryRepository;

public class RegisterDelivery {
    private final DeliveryRepository deliveries;

    public RegisterDelivery(DeliveryRepository deliveries) { this.deliveries = deliveries; }

    public Delivery register(String id, String destination) {
        Delivery delivery = new Delivery(id, destination);
        deliveries.save(delivery);
        return delivery;
    }
}
