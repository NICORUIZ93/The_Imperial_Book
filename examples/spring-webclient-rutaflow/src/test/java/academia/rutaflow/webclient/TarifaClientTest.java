package academia.rutaflow.webclient;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import mockwebserver3.MockResponse;
import mockwebserver3.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.test.StepVerifier;

class TarifaClientTest {
    private MockWebServer server;
    private TarifaClient client;

    @BeforeEach
    void startServer() throws IOException {
        server = new MockWebServer();
        server.start();
        client = new TarifaClient(WebClient.builder(), server.url("/").toString());
    }

    @AfterEach
    void stopServer() throws IOException {
        server.close();
    }

    @Test
    void composesLocationAndTariffRequestsInOrder() throws InterruptedException {
        enqueueJson("{\"zone\":\"zona-sur\"}");
        enqueueJson("15.5");

        StepVerifier.create(client.calcularTarifaCompleta("RF-001"))
                .expectNext(15.5)
                .expectComplete()
                .verify(Duration.ofSeconds(2));

        assertThat(server.takeRequest().getTarget()).isEqualTo("/ubicacion/RF-001");
        assertThat(server.takeRequest().getTarget()).isEqualTo("/tarifa?zona=zona-sur");
    }

    @Test
    void httpServerErrorArrivesAsReactiveError() {
        server.enqueue(new MockResponse.Builder().code(503).build());

        StepVerifier.create(client.calcularTarifaCompleta("RF-001"))
                .expectError(WebClientResponseException.class)
                .verify(Duration.ofSeconds(2));
    }

    @Test
    void timeoutCancelsAResponseThatArrivesTooLate() {
        enqueueJson("{\"zone\":\"zona-sur\"}");
        server.enqueue(new MockResponse.Builder()
                .body("15.5")
                .addHeader("Content-Type", "application/json")
                .bodyDelay(500, TimeUnit.MILLISECONDS)
                .build());

        StepVerifier.create(client.calcularTarifaConPlazo("RF-001", Duration.ofMillis(200)))
                .expectError(TimeoutException.class)
                .verify(Duration.ofSeconds(2));

        assertThat(server.getRequestCount()).isEqualTo(2);
    }

    private void enqueueJson(String body) {
        server.enqueue(new MockResponse.Builder()
                .body(body)
                .addHeader("Content-Type", "application/json")
                .build());
    }
}
