package academia.rutaflow.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.ResourceAccessException;

@SpringBootTest
class RouteClientDeadlineTest {
    private static HttpServer backend;

    @Autowired
    private RouteClient routeClient;

    @BeforeAll
    static void startBackend() throws IOException {
        backend = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        backend.setExecutor(Executors.newCachedThreadPool());
        backend.createContext("/routes", exchange -> {
            String id = exchange.getRequestURI().getPath().substring("/routes/".length());
            if (id.equals("lenta")) {
                try {
                    Thread.sleep(900);
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    exchange.close();
                    return;
                }
            }
            byte[] body = ("ruta " + id).getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        backend.start();
    }

    @AfterAll
    static void stopBackend() {
        backend.stop(0);
    }

    @DynamicPropertySource
    static void backendUri(DynamicPropertyRegistry properties) {
        properties.add("spring.cloud.discovery.client.simple.instances.route-catalog[0].uri",
            () -> "http://127.0.0.1:" + backend.getAddress().getPort());
    }

    @Test
    void interfaceHttpLlegaAlServicioEncontradoPorElNombre() {
        assertThat(routeClient.find("RF-001")).isEqualTo("ruta RF-001");
    }

    @Test
    void timeoutDeLecturaCortaLaRespuestaLenta() {
        long start = System.nanoTime();
        assertThatThrownBy(() -> routeClient.find("lenta"))
            .isInstanceOf(ResourceAccessException.class);
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;

        assertThat(elapsedMs).isLessThan(750);
    }
}
