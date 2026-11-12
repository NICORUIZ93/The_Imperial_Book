package academia.rutaflow.hexagonal.domain;

import java.util.Optional;

/** Port: el dominio define la operación sin elegir la base de datos. */
public interface DeliveryRepository {
    void save(Delivery delivery);
    Optional<Delivery> findById(String id);
}
