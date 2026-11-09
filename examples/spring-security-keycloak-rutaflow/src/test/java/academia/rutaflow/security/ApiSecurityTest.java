package academia.rutaflow.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(MockJwtConfiguration.class)
class ApiSecurityTest {
    @LocalServerPort
    private int port;

    private final HttpClient http = HttpClient.newHttpClient();

    @Test
    void sinBearerTokenRecibe401() throws Exception {
        assertThat(send("GET", "/api/pedidos/p-ana", null).statusCode()).isEqualTo(401);
    }

    @Test
    void tokenSinRolDeEscrituraRecibe403() throws Exception {
        assertThat(send("POST", "/api/ubicaciones/1", "luis").statusCode()).isEqualTo(403);
    }

    @Test
    void rolDeEscrituraPermiteGuardarUbicacion() throws Exception {
        assertThat(send("POST", "/api/ubicaciones/1", "ana").statusCode()).isEqualTo(200);
    }

    @Test
    void tokenSoloLeePedidosDeSuSubject() throws Exception {
        assertThat(send("GET", "/api/pedidos/p-ana", "ana").statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/pedidos/p-luis", "ana").statusCode()).isEqualTo(403);
    }

    @Test
    void corsPermiteOrigenLocalDeclaradoYRechazaOtroOrigen() throws Exception {
        var permitido = preflight("http://localhost:4200");
        assertThat(permitido.statusCode()).isEqualTo(200);
        assertThat(permitido.headers().firstValue("Access-Control-Allow-Origin"))
            .contains("http://localhost:4200");
        assertThat(permitido.headers().firstValue("Access-Control-Allow-Credentials")).isEmpty();

        var rechazado = preflight("https://sitio-ajeno.example");
        assertThat(rechazado.statusCode()).isEqualTo(403);
        assertThat(rechazado.headers().firstValue("Access-Control-Allow-Origin")).isEmpty();
    }

    private HttpResponse<String> send(String method, String path, String bearerToken) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (bearerToken != null) {
            request.header("Authorization", "Bearer " + bearerToken);
        }
        if ("POST".equals(method)) {
            request.POST(BodyPublishers.noBody());
        } else {
            request.GET();
        }
        return http.send(request.build(), BodyHandlers.ofString());
    }

    private HttpResponse<String> preflight(String origin) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/ubicaciones/1"))
            .header("Origin", origin)
            .header("Access-Control-Request-Method", "POST")
            .header("Access-Control-Request-Headers", "authorization,content-type")
            .method("OPTIONS", BodyPublishers.noBody())
            .build();
        return http.send(request, BodyHandlers.ofString());
    }
}
