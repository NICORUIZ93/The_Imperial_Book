package academia.rutaflow.resilience;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class PedidosClient {
    private final CircuitBreaker circuitBreaker;
    private final HttpClient http = HttpClient.newHttpClient();
    private final String pedidosUrl;

    public PedidosClient(CircuitBreaker circuitBreaker,
                         @Value("${rutaflow.catalog.uri}") String pedidosUrl) {
        this.circuitBreaker = circuitBreaker;
        this.pedidosUrl = pedidosUrl;
    }

    public String consultarPedido() {
        return circuitBreaker.executeSupplier(this::solicitarPedido);
    }

    private String solicitarPedido() {
        HttpRequest request = HttpRequest.newBuilder(URI.create(pedidosUrl)).GET().build();
        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 500) {
                throw new IllegalStateException("servicio-pedidos respondió " + response.statusCode());
            }
            return response.body();
        } catch (IOException exception) {
            throw new IllegalStateException("no se pudo consultar servicio-pedidos", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("consulta interrumpida", exception);
        }
    }
}
