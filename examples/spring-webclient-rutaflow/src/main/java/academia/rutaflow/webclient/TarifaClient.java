package academia.rutaflow.webclient;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class TarifaClient {
    private final WebClient webClient;

    public TarifaClient(WebClient.Builder builder, @Value("${tarifa.base-url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public Mono<UbicacionResponse> obtenerUbicacion(String trackingCode) {
        return webClient.get()
                .uri("/ubicacion/{codigo}", trackingCode)
                .retrieve()
                .bodyToMono(UbicacionResponse.class);
    }

    public Mono<Double> obtenerTarifa(String zona) {
        return webClient.get()
                .uri(builder -> builder.path("/tarifa").queryParam("zona", zona).build())
                .retrieve()
                .bodyToMono(Double.class);
    }

    public Mono<Double> calcularTarifaCompleta(String trackingCode) {
        return obtenerUbicacion(trackingCode)
                .flatMap(ubicacion -> obtenerTarifa(ubicacion.zone()));
    }

    public Mono<Double> calcularTarifaConPlazo(String trackingCode, Duration timeout) {
        return calcularTarifaCompleta(trackingCode).timeout(timeout);
    }
}
