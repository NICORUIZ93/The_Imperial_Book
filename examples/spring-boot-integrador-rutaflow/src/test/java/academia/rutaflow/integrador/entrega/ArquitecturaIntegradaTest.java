package academia.rutaflow.integrador.entrega;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ArquitecturaIntegradaTest {
    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void propiedadesPostgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        properties.add("spring.datasource.username", POSTGRES::getUsername);
        properties.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @LocalServerPort
    int port;

    @Autowired
    EntregaRepository entregas;

    @Test
    void postRecorreHttpCapasFlywayYPostgres() throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/entregas"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"destinatario\":\"Tienda Norte\"}", StandardCharsets.UTF_8))
            .build();

        var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(201);
        assertThat(response.headers().firstValue("Location"))
            .hasValueSatisfying(location -> assertThat(location).contains("/api/entregas/"));
        assertThat(response.body()).contains("\"destinatario\":\"Tienda Norte\"")
            .contains("\"estado\":\"CREADA\"");
        assertThat(entregas.existsByDestinatario("Tienda Norte")).isTrue();
    }

    @Test
    void destinatarioVacioSeRechazaAntesDeGuardar() throws Exception {
        long entregasAntes = entregas.count();
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/entregas"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"destinatario\":\" \"}", StandardCharsets.UTF_8))
            .build();

        var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(entregas.count()).isEqualTo(entregasAntes);
    }
}
