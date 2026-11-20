package academia.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import academia.config.catalogo.CatalogoConfigApp;
import academia.config.servidor.ConfigServidorApp;
import java.net.ServerSocket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.context.ConfigurableApplicationContext;

class ConfigServerTest {

    final HttpClient http = HttpClient.newHttpClient();

    @Test
    void elServidorMezclaYElClienteRecibeLaFuenteDeMayorPrioridad() throws Exception {
        int puertoServidor = libre();
        try (ConfigurableApplicationContext servidor = ConfigServidorApp.arrancar("--server.port=" + puertoServidor)) {
            String json = http.send(HttpRequest.newBuilder(URI.create(
                    "http://localhost:" + puertoServidor + "/catalogo/prod")).build(),
                HttpResponse.BodyHandlers.ofString()).body();
            assertThat(json).contains("catalogo-prod.yml", "\"catalogo.pagina\":50");

            try (ConfigurableApplicationContext cliente = CatalogoConfigApp.arrancar("--server.port=0",
                    "--spring.profiles.active=prod", "--CONFIG_URL=http://localhost:" + puertoServidor)) {
                Map<String, Object> ajustes = cliente.getBean(CatalogoConfigApp.Ajustes.class).comoMapa();
                assertThat(ajustes).containsEntry("pagina", 50)          // catalogo-prod.yml gana
                                   .containsEntry("banner", "Black Friday")
                                   .containsEntry("moneda", "COP");      // viene de application.yml
            }
        }
    }

    @Test
    void sinConfigServerElClienteNoArranca() throws Exception {
        int nadieEscucha = libre();
        assertThatThrownBy(() -> CatalogoConfigApp.arrancar("--server.port=0",
                "--CONFIG_URL=http://localhost:" + nadieEscucha).close())
            .hasStackTraceContaining("Could not locate PropertySource");
    }

    static int libre() throws Exception {
        try (ServerSocket s = new ServerSocket(0)) {
            return s.getLocalPort();
        }
    }
}
