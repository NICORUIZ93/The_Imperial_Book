package academia.rutaflow.pedidos;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ConductorClient {
    private final RestClient.Builder builder;

    public ConductorClient(RestClient.Builder builder) {
        this.builder = builder;
    }

    public DriverAvailability availability(int port, String driverId) {
        return builder.clone()
                .baseUrl("http://localhost:" + port)
                .build()
                .get()
                .uri("/drivers/{driverId}", driverId)
                .retrieve()
                .body(DriverAvailability.class);
    }

    public record DriverAvailability(String driverId, boolean available) {}
}
