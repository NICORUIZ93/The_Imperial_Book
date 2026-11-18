package academia.rutaflow.cloud;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ConfigServerAndDiscoveryTest {
    @LocalServerPort
    private int port;

    @Autowired
    private DiscoveryClient discoveryClient;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void sirveConfiguracionDefaultYProduccionPorHttp() throws Exception {
        HttpResponse<String> desarrollo = get("/servicio-pedidos/default");
        HttpResponse<String> produccion = get("/servicio-pedidos/produccion");

        assertThat(desarrollo.statusCode()).isEqualTo(200);
        assertThat(desarrollo.body()).contains("descuento-maximo", "15");
        assertThat(produccion.statusCode()).isEqualTo(200);
        assertThat(produccion.body()).contains("descuento-maximo", "5");
    }

    @Test
    void rechazaUnNombreDeAplicacionQueNoTieneArchivo() throws Exception {
        HttpResponse<String> response = get("/servicio-inexistente/default");

        assertThat(response.statusCode()).isEqualTo(404);
    }

    @Test
    void resuelveInstanciaCatalogoConSimpleDiscoveryClient() {
        List<ServiceInstance> instances = discoveryClient.getInstances("catalogo");

        assertThat(instances).hasSize(1);
        assertThat(instances.getFirst().getUri()).isEqualTo(URI.create("http://localhost:8081"));
        assertThat(discoveryClient.getInstances("pedidos")).isEmpty();
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET().build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
