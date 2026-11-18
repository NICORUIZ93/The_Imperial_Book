package academia.rutaflow.clean.application;

import academia.rutaflow.clean.domain.Delivery;
import academia.rutaflow.clean.domain.DeliveryAlreadyAssigned;
import academia.rutaflow.clean.domain.DeliveryId;
import academia.rutaflow.clean.domain.DeliveryStatus;
import academia.rutaflow.clean.domain.Destination;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AssignDeliveryTest {
    @Test
    void useCaseAssignsDeliveryThroughThePortWithoutStartingSpring() {
        var repository = new FakeDeliveryRepository();
        var useCase = new AssignDelivery(repository);

        Delivery result = useCase.execute(new DeliveryId("D-17"), new Destination("Bogotá"));

        assertThat(result.status()).isEqualTo(DeliveryStatus.ASSIGNED);
        assertThat(repository.findById(result.id())).contains(result);
    }

    @Test
    void domainRuleRejectsAssigningADestinationTwice() {
        Delivery assigned = Delivery.create(new DeliveryId("D-18"))
            .assignTo(new Destination("Cali"));

        assertThatThrownBy(() -> assigned.assignTo(new Destination("Medellín")))
            .isInstanceOf(DeliveryAlreadyAssigned.class);
    }

    private static class FakeDeliveryRepository implements DeliveryRepository {
        private final Map<DeliveryId, Delivery> values = new HashMap<>();

        @Override
        public Optional<Delivery> findById(DeliveryId id) {
            return Optional.ofNullable(values.get(id));
        }

        @Override
        public void save(Delivery delivery) {
            values.put(delivery.id(), delivery);
        }
    }
}
