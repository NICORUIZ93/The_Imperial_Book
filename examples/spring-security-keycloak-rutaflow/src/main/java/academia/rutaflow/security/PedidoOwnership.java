package academia.rutaflow.security;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class PedidoOwnership {
    private final Map<String, String> ownerByOrderId;

    public PedidoOwnership(
        @Value("${rutaflow.orders.owners.p-ana:ana}") String anaSubject,
        @Value("${rutaflow.orders.owners.p-luis:luis}") String luisSubject) {
        this.ownerByOrderId = Map.of("p-ana", anaSubject, "p-luis", luisSubject);
    }

    public void requireOwner(String subject, String orderId) {
        String owner = ownerByOrderId.get(orderId);
        if (owner == null) {
            throw new IllegalArgumentException("Pedido no encontrado: " + orderId);
        }
        if (!owner.equals(subject)) {
            throw new AccessDeniedException("El pedido pertenece a otra persona");
        }
    }
}
