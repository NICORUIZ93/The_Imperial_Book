package academia.rutaflow.tracing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@ConditionalOnProperty(name = "rutaflow.role", havingValue = "delivery")
public class DeliveryController {
    private final RestClient inventory;
    private final ObservationRegistry observations;

    public DeliveryController(RestClient.Builder builder,
                              ObservationRegistry observations,
                              @Value("${rutaflow.inventory-url}") String inventoryUrl) {
        this.inventory = builder.baseUrl(inventoryUrl).build();
        this.observations = observations;
    }

    @GetMapping("/deliveries/RF-314")
    DeliveryResponse deliver() {
        return Observation.createNotStarted("rutaflow.delivery.prepare", observations)
                .lowCardinalityKeyValue("operation", "reserve-inventory")
                .observe(() -> {
                    InventoryResponse stock = inventory.get().uri("/inventory/RF-314")
                            .retrieve().body(InventoryResponse.class);
                    return new DeliveryResponse("RF-314", "en ruta", stock.message());
                });
    }

    record DeliveryResponse(String pedido, String estado, String inventario) {}
    record InventoryResponse(String message) {}
}
