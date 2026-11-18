package academia.rutaflow.hexagonal.infrastructure;

import academia.rutaflow.hexagonal.domain.Delivery;
import academia.rutaflow.hexagonal.domain.DeliveryRepository;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/** Adapter de práctica: guarda los datos mientras vive el proceso. */
public class InMemoryDeliveryRepository implements DeliveryRepository {
    private final ConcurrentMap<String, Delivery> rows = new ConcurrentHashMap<>();

    @Override public void save(Delivery delivery) { rows.put(delivery.id(), delivery); }
    @Override public Optional<Delivery> findById(String id) { return Optional.ofNullable(rows.get(id)); }
}
