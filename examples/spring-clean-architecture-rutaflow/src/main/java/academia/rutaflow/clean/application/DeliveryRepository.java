package academia.rutaflow.clean.application;

import academia.rutaflow.clean.domain.Delivery;
import academia.rutaflow.clean.domain.DeliveryId;

import java.util.Optional;

public interface DeliveryRepository {
    Optional<Delivery> findById(DeliveryId id);
    void save(Delivery delivery);
}
