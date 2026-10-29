import java.util.ArrayList;
import java.util.List;

record ShipmentId(String value) {
    ShipmentId {
        if (value == null || value.isBlank()) throw new IllegalArgumentException("id requerido");
    }
}

record Shipment(ShipmentId id, String status) {
    Shipment {
        if (status == null || status.isBlank()) throw new IllegalArgumentException("estado requerido");
    }
}

interface ShipmentRepository {
    void save(Shipment shipment);
    Shipment find(ShipmentId id);
}

final class InMemoryShipmentRepository implements ShipmentRepository {
    private final List<Shipment> values = new ArrayList<>();

    @Override public void save(Shipment shipment) { values.removeIf(value -> value.id().equals(shipment.id())); values.add(shipment); }
    @Override public Shipment find(ShipmentId id) { return values.stream().filter(value -> value.id().equals(id)).findFirst().orElse(null); }
}

final class CreateShipment {
    private final ShipmentRepository repository;

    CreateShipment(ShipmentRepository repository) { this.repository = repository; }

    Shipment execute(String id) {
        Shipment shipment = new Shipment(new ShipmentId(id), "CREATED");
        repository.save(shipment);
        return shipment;
    }
}

public class Main {
    public static void main(String[] args) {
        ShipmentRepository repository = new InMemoryShipmentRepository();
        CreateShipment useCase = new CreateShipment(repository);
        Shipment shipment = useCase.execute("ENV-42");
        if (!"CREATED".equals(repository.find(shipment.id()).status())) throw new AssertionError("estado incorrecto");
        System.out.println("shipment=" + shipment.id().value() + " status=" + shipment.status());
    }
}
