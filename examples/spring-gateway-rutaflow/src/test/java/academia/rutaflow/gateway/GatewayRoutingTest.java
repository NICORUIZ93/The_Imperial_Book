package academia.rutaflow.gateway;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRoutingTest {
    private static final AtomicReference<String> backendPath = new AtomicReference<>();
    private static final AtomicInteger backendRequests = new AtomicInteger();
    private static HttpServer backend;

    @Value("${local.server.port}")
    private int gatewayPort;

    private final HttpClient client = HttpClient.newHttpClient();

    @DynamicPropertySource
    static void routeToLocalBackend(DynamicPropertyRegistry properties) {
        startBackend();
        properties.add("rutaflow.backend.uri", () ->
            "http://localhost:" + backend.getAddress().getPort());
    }

    @BeforeEach
    void resetBackendEvidence() {
        backendPath.set(null);
        backendRequests.set(0);
    }

    @AfterAll
    static void stopBackend() {
        if (backend != null) {
            backend.stop(0);
        }
    }

    @Test
    void quitaApiYReenviaLaPeticionAlBackend() throws Exception {
        HttpResponse<String> response = get("/api/pedidos/1");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).isEqualTo("{\"id\":1,\"estado\":\"EN_RUTA\"}");
        assertThat(backendPath.get()).isEqualTo("/pedidos/1");
        assertThat(backendRequests.get()).isEqualTo(1);
    }

    @Test
    void unaRutaQueNoCoincideNoLlegaAlBackend() throws Exception {
        HttpResponse<String> response = get("/api/entregas/1");

        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(backendRequests.get()).isZero();
        assertThat(backendPath.get()).isNull();
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(
            URI.create("http://localhost:" + gatewayPort + path)).GET().build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static void startBackend() {
        if (backend != null) {
            return;
        }
        try {
            backend = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
            backend.createContext("/", exchange -> {
                backendPath.set(exchange.getRequestURI().getPath());
                backendRequests.incrementAndGet();
                boolean found = "/pedidos/1".equals(backendPath.get());
                byte[] body = (found
                    ? "{\"id\":1,\"estado\":\"EN_RUTA\"}"
                    : "{\"error\":\"ruta no encontrada\"}").getBytes();
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(found ? 200 : 404, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            backend.start();
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo iniciar el backend de prueba", exception);
        }
    }
}
