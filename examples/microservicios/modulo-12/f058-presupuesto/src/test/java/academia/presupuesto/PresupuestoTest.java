package academia.presupuesto;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PresupuestoTest {

    static HttpServer pedidos;
    static final AtomicInteger llamadas = new AtomicInteger();
    static final AtomicLong deadlineRecibido = new AtomicLong();

    /** "pedidos" lento: tarda 1500 ms y anota el X-Deadline que le llega. */
    @DynamicPropertySource
    static void pedidos(DynamicPropertyRegistry r) throws Exception {
        pedidos = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        pedidos.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        pedidos.createContext("/", ex -> {
            llamadas.incrementAndGet();
            deadlineRecibido.set(Long.parseLong(ex.getRequestHeaders().getFirst("X-Deadline")));
            try { Thread.sleep(1500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            byte[] b = "{\"estado\":\"PAGADO\"}".getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        pedidos.start();
        r.add("pedidos.url", () -> "http://127.0.0.1:" + pedidos.getAddress().getPort());
    }

    @AfterAll
    static void apagar() { pedidos.stop(0); }

    @Value("${local.server.port}") int puerto;
    final HttpClient http = HttpClient.newHttpClient();

    HttpResponse<String> get(Long deadline) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + "/bff/pedidos/1"));
        if (deadline != null) b.header("X-Deadline", String.valueOf(deadline));
        return http.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void respondeDegradadoDentroDelPresupuestoYPropagaUnDeadlineMasCorto() throws Exception {
        long deadline = System.currentTimeMillis() + 1000;
        long t0 = System.nanoTime();
        HttpResponse<String> r = get(deadline);
        long ms = (System.nanoTime() - t0) / 1_000_000;
        assertThat(r.statusCode()).isEqualTo(200);
        assertThat(r.body()).contains("\"degradado\":true");
        assertThat(ms).isLessThan(1000);
        assertThat(deadlineRecibido.get()).isEqualTo(deadline - 50);
    }

    @Test
    void sinCabeceraUsaElPresupuestoPorDefecto() throws Exception {
        long t0 = System.nanoTime();
        assertThat(get(null).body()).contains("\"degradado\":true");
        assertThat((System.nanoTime() - t0) / 1_000_000).isBetween(700L, 1000L);
    }

    @Test
    void conElPresupuestoAgotadoNoLlamaANadie() throws Exception {
        int antes = llamadas.get();
        HttpResponse<String> r = get(System.currentTimeMillis() - 10);
        assertThat(r.statusCode()).isEqualTo(504);
        assertThat(r.body()).contains("SIN_PRESUPUESTO");
        assertThat(llamadas).hasValue(antes);
    }
}
