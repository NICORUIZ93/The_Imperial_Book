package academia.rutaflow.decision;

import static org.springframework.test.web.reactive.server.WebTestClient.bindToServer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DecisionApplicationTest {
    @LocalServerPort
    private int port;

    @Test
    void r2dbcReadsAnExistingDelivery() {
        WebTestClient client = client();
        client.get().uri("/deliveries/RF-001")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.trackingCode").isEqualTo("RF-001")
                .jsonPath("$.status").isEqualTo("IN_ROUTE");
    }

    @Test
    void reactiveEndpointReturnsSuccessfully() {
        client().get().uri("/demo/reactive")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo("respuesta reactiva");
    }

    @Test
    void blockInsideNettyEventLoopIsRejected() {
        client().get().uri("/demo/block")
                .exchange()
                .expectStatus().is5xxServerError();
    }

    @Test
    void unavoidableBlockingCallCanBeIsolatedOnBoundedElastic() {
        client().get().uri("/demo/legacy")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).value(thread -> org.assertj.core.api.Assertions
                        .assertThat(thread).startsWith("boundedElastic-"));
    }

    private WebTestClient client() {
        return bindToServer().baseUrl("http://localhost:" + port).build();
    }
}
