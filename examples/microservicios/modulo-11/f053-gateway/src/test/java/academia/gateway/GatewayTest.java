package academia.gateway;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayTest {

    static Backend catalogo, inventario;

    @DynamicPropertySource
    static void rutas(DynamicPropertyRegistry r) throws Exception {
        catalogo = new Backend(0, p -> "\"catalogo recibió " + p.replace("|", " con X-Request-Id=") + "\"");
        inventario = new Backend(0, p -> "\"inventario recibió " + p.replace("|", " con X-Request-Id=") + "\"");
        r.add("CATALOGO_URL", catalogo::url);
        r.add("INVENTARIO_URL", inventario::url);
    }

    @AfterAll
    static void apagar() {
        catalogo.close();
        inventario.close();
    }

    @Value("${local.server.port}") int puerto;
    final HttpClient http = HttpClient.newHttpClient();

    HttpResponse<String> get(String ruta, String requestId) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + ruta));
        if (requestId != null) b.header("X-Request-Id", requestId);
        return http.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void enrutaPorPrefijoYQuitaElPrefijo() throws Exception {
        HttpResponse<String> r = get("/api/catalogo/productos/7", "req-001");
        assertThat(r.statusCode()).isEqualTo(200);
        assertThat(r.body()).isEqualTo("\"catalogo recibió /productos/7 con X-Request-Id=req-001\"");
        assertThat(r.headers().firstValue("X-Gateway")).hasValue("academia");
    }

    @Test
    void generaUnRequestIdSiElClienteNoLoEnvia() throws Exception {
        HttpResponse<String> r = get("/api/inventario/stock/7", null);
        String id = r.headers().firstValue("X-Request-Id").orElseThrow();
        assertThat(id).hasSize(36);                                   // un UUID
        assertThat(r.body()).contains("inventario recibió /stock/7 con X-Request-Id=" + id);
    }

    @Test
    void loQueNoTieneRutaDa404() throws Exception {
        assertThat(get("/api/pagos/1", "req-003").statusCode()).isEqualTo(404);
    }
}
