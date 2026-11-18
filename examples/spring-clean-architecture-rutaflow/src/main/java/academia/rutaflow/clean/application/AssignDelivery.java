package academia.rutaflow.clean.application;

import academia.rutaflow.clean.domain.Delivery;
import academia.rutaflow.clean.domain.DeliveryId;
import academia.rutaflow.clean.domain.Destination;
import org.springframework.stereotype.Service;

@Service
public class AssignDelivery {
    private final DeliveryRepository deliveries;

    public AssignDelivery(DeliveryRepository deliveries) {
        this.deliveries = deliveries;
    }

    public Delivery execute(DeliveryId id, Destination destination) {
        Delivery current = deliveries.findById(id).orElseGet(() -> Delivery.create(id));
        Delivery assigned = current.assignTo(destination);
        deliveries.save(assigned);
        return assigned;
    }
}
