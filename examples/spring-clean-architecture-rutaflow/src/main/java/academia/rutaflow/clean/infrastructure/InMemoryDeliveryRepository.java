package academia.rutaflow.clean.infrastructure;

import academia.rutaflow.clean.application.DeliveryRepository;
import academia.rutaflow.clean.domain.Delivery;
import academia.rutaflow.clean.domain.DeliveryId;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryDeliveryRepository implements DeliveryRepository {
    private final Map<DeliveryId, Delivery> deliveries = new ConcurrentHashMap<>();

    @Override
    public Optional<Delivery> findById(DeliveryId id) {
        return Optional.ofNullable(deliveries.get(id));
    }

    @Override
    public void save(Delivery delivery) {
        deliveries.put(delivery.id(), delivery);
    }
}
