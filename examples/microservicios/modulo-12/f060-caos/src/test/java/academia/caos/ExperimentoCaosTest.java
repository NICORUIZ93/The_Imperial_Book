package academia.caos;

import static org.assertj.core.api.Assertions.assertThat;

import eu.rekawek.toxiproxy.Proxy;
import eu.rekawek.toxiproxy.ToxiproxyClient;
import eu.rekawek.toxiproxy.model.ToxicDirection;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.Testcontainers;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.toxiproxy.ToxiproxyContainer;

@org.testcontainers.junit.jupiter.Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ExperimentoCaosTest {

    static final InventarioFalso inventario;
    static {
        try {
            inventario = new InventarioFalso();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
        // Toxiproxy corre en un contenedor: le abrimos el puerto del inventario de esta JVM.
        Testcontainers.exposeHostPorts(inventario.puerto());
    }

    @Container
    static ToxiproxyContainer toxiproxy = new ToxiproxyContainer("ghcr.io/shopify/toxiproxy:2.13.0");
    static Proxy proxy;

    @DynamicPropertySource
    static void inventario(DynamicPropertyRegistry r) throws Exception {
        ToxiproxyClient api = new ToxiproxyClient(toxiproxy.getHost(), toxiproxy.getControlPort());
        proxy = api.createProxy("inventario", "0.0.0.0:8666", "host.testcontainers.internal:" + inventario.puerto());
        r.add("inventario.url", () -> "http://" + toxiproxy.getHost() + ":" + toxiproxy.getMappedPort(8666));
    }

    @AfterAll
    static void apagar() { inventario.close(); }

    @Value("${local.server.port}") int puerto;
    final HttpClient http = HttpClient.newHttpClient();

    record Medida(long p95, int errores, int degradadas) {}

    Medida medir(int peticiones) throws Exception {
        List<Long> tiempos = new ArrayList<>();
        int errores = 0, degradadas = 0;
        for (int i = 0; i < peticiones; i++) {
            long t0 = System.nanoTime();
            HttpResponse<String> r = http.send(HttpRequest.newBuilder(
                URI.create("http://localhost:" + puerto + "/productos/7")).build(), HttpResponse.BodyHandlers.ofString());
            tiempos.add((System.nanoTime() - t0) / 1_000_000);
            if (r.statusCode() >= 500) errores++;
            if (r.body().contains("\"degradado\":true")) degradadas++;
        }
        Collections.sort(tiempos);
        return new Medida(tiempos.get((int) Math.ceil(0.95 * peticiones) - 1), errores, degradadas);
    }

    @Test
    void conSeiscientosMsDeLatenciaElP95SigueBajoTrescientos() throws Exception {
        medir(5);                                                       // calentamiento
        Medida estable = medir(10);
        assertThat(estable.degradadas()).isZero();

        proxy.toxics().latency("lenta", ToxicDirection.DOWNSTREAM, 600);   // inyectar
        Medida conFallo;
        try {
            conFallo = medir(10);
        } finally {
            proxy.toxics().get("lenta").remove();                           // revertir SIEMPRE
        }
        assertThat(conFallo.p95()).as("hipótesis: p95 < 300 ms").isLessThan(300);
        assertThat(conFallo.errores()).isZero();
        assertThat(conFallo.degradadas()).isEqualTo(10);

        assertThat(medir(10).degradadas()).as("tras revertir, todo vuelve a la normalidad").isZero();
    }
}
