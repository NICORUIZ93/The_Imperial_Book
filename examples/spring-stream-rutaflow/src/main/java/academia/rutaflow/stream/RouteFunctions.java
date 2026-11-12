package academia.rutaflow.stream;

import java.util.function.Function;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteFunctions {
    @Bean
    public Function<ShipmentCreated, RoutePlanningRequested> planRoute() {
        return shipment -> {
            if (shipment.postalCode() == null || shipment.postalCode().length() < 2) {
                throw new IllegalArgumentException("El código postal debe tener dos caracteres");
            }
            if (shipment.postalCode().startsWith("XX")) {
                throw new IllegalArgumentException("La zona XX requiere revisión manual");
            }
            return new RoutePlanningRequested(
                    shipment.shipmentId(), shipment.postalCode().substring(0, 2));
        };
    }
}
