package academia.rutaflow.resilience;

import com.sun.net.httpserver.HttpServer;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CircuitBreakerBehaviorTest {
    private static final AtomicInteger solicitudesBackend = new AtomicInteger();
    private static volatile int respuestaBackend;
    private static HttpServer backend;

    @Value("${local.server.port}")
    private int appPort;

    @Autowired
    private CircuitBreaker pedidosCircuitBreaker;

    private final HttpClient http = HttpClient.newHttpClient();

    @DynamicPropertySource
    static void configurarBackendDePrueba(DynamicPropertyRegistry properties) {
        iniciarBackend();
        properties.add("rutaflow.catalog.uri", () ->
            "http://localhost:" + backend.getAddress().getPort() + "/pedidos/1");
    }

    @BeforeEach
    void prepararBackend() {
        pedidosCircuitBreaker.reset();
        solicitudesBackend.set(0);
        respuestaBackend = 503;
    }

    @AfterAll
    static void detenerBackend() {
        if (backend != null) {
            backend.stop(0);
        }
    }

    @Test
    void abreDespuesDeCuatroFallosYBloqueaLaQuintaLlamada() throws Exception {
        for (int intento = 0; intento < 4; intento++) {
            assertThat(getPedido().statusCode()).isEqualTo(503);
        }

        assertThat(pedidosCircuitBreaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);
        assertThat(solicitudesBackend).hasValue(4);
    }

    @Test
    void openImpideLaQuintaPeticionHttpAlBackend() throws Exception {
        for (int intento = 0; intento < 4; intento++) {
            getPedido();
        }
        assertThat(pedidosCircuitBreaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);

        HttpResponse<String> bloqueada = getPedido();

        assertThat(bloqueada.statusCode()).isEqualTo(503);
        assertThat(bloqueada.body()).contains("Circuito abierto");
        assertThat(solicitudesBackend).hasValue(4);
    }

    @Test
    void vuelveACerradoCuandoLasDosLlamadasDePruebaTienenExito() throws Exception {
        for (int intento = 0; intento < 4; intento++) {
            getPedido();
        }
        assertThat(pedidosCircuitBreaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);

        // La prueba fuerza el estado para no esperar el minuto del temporizador.
        pedidosCircuitBreaker.transitionToHalfOpenState();
        respuestaBackend = 200;

        assertThat(getPedido().statusCode()).isEqualTo(200);
        assertThat(pedidosCircuitBreaker.getState()).isEqualTo(CircuitBreaker.State.HALF_OPEN);
        assertThat(getPedido().statusCode()).isEqualTo(200);
        assertThat(pedidosCircuitBreaker.getState()).isEqualTo(CircuitBreaker.State.CLOSED);
        assertThat(solicitudesBackend).hasValue(6);
    }

    private HttpResponse<String> getPedido() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(
            URI.create("http://localhost:" + appPort + "/api/pedidos/1")).GET().build();
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static void iniciarBackend() {
        if (backend != null) {
            return;
        }
        try {
            backend = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
            backend.createContext("/pedidos/1", exchange -> {
                solicitudesBackend.incrementAndGet();
                byte[] body = (respuestaBackend == 200
                    ? "{\"id\":1,\"estado\":\"EN_RUTA\"}"
                    : "{\"error\":\"servicio no disponible\"}").getBytes();
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(respuestaBackend, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            backend.start();
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo iniciar el backend de prueba", exception);
        }
    }
}
