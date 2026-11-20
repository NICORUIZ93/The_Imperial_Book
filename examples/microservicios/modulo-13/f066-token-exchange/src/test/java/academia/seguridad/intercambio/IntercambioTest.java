package academia.seguridad.intercambio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** Un HttpServer del JDK hace de STS (/token) y de servicio pagos (/cobros) y anota lo que recibe. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(IntercambioTest.TokenDeAna.class)
class IntercambioTest {

    static final Map<String, String> visto = new ConcurrentHashMap<>();
    static volatile int codigoSts = 200;
    static final HttpServer falso = arrancar();

    static HttpServer arrancar() {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/token", ex -> {
                visto.put("sts.auth", ex.getRequestHeaders().getFirst("Authorization"));
                visto.put("sts.form", new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                responder(ex, codigoSts, codigoSts == 200
                    ? "{\"access_token\":\"token-canjeado-pagos\",\"issued_token_type\":\"urn:ietf:params:oauth:token-type:access_token\",\"token_type\":\"Bearer\",\"expires_in\":60}"
                    : "{\"error\":\"invalid_target\"}");
            });
            s.createContext("/cobros", ex -> {
                visto.put("pagos.auth", ex.getRequestHeaders().getFirst("Authorization"));
                responder(ex, 200, "{\"estado\":\"cobrado\"}");
            });
            s.start();
            return s;
        } catch (IOException e) { throw new IllegalStateException(e); }
    }

    static void responder(HttpExchange ex, int codigo, String json) throws IOException {
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.sendResponseHeaders(codigo, b.length);
        ex.getResponseBody().write(b);
        ex.close();
    }

    @DynamicPropertySource
    static void urls(DynamicPropertyRegistry r) {
        String base = "http://127.0.0.1:" + falso.getAddress().getPort();
        r.add("tienda.sts.token-uri", () -> base + "/token");
        r.add("tienda.pagos.url", () -> base);
    }

    @AfterAll
    static void parar() { falso.stop(0); }

    @BeforeEach
    void limpiar() { visto.clear(); codigoSts = 200; }

    @TestConfiguration
    static class TokenDeAna {
        @Bean
        JwtDecoder jwtDecoder() {
            return token -> Jwt.withTokenValue(token).header("alg", "RS256").subject("ana")
                .audience(List.of("pedidos")).issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300)).build();
        }
    }

    @Autowired MockMvc mvc;

    static Map<String, String> form(String crudo) {
        Map<String, String> m = new HashMap<>();
        for (String par : crudo.split("&")) {
            String[] kv = par.split("=", 2);
            m.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8), URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
        }
        return m;
    }

    @Test
    void canjeaElTokenYLlamaAPagosConElNuevo() throws Exception {
        mvc.perform(post("/pedidos/7/pagar").header("Authorization", "Bearer token-de-ana"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("cobrado"));

        assertThat(form(visto.get("sts.form")))
            .containsEntry("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange")
            .containsEntry("subject_token", "token-de-ana")
            .containsEntry("subject_token_type", "urn:ietf:params:oauth:token-type:access_token")
            .containsEntry("audience", "pagos")
            .containsEntry("scope", "pagos:cobrar");
        assertThat(visto.get("sts.auth"))
            .isEqualTo("Basic " + Base64.getEncoder().encodeToString("pedidos:solo-dev-pedidos".getBytes(StandardCharsets.UTF_8)));
        assertThat(visto.get("pagos.auth")).isEqualTo("Bearer token-canjeado-pagos");   // nunca el de ana
    }

    @Test
    void siElStsRechazaRespondes502SinLlamarAPagos() throws Exception {
        codigoSts = 400;
        mvc.perform(post("/pedidos/7/pagar").header("Authorization", "Bearer token-de-ana"))
            .andExpect(status().isBadGateway());
        assertThat(visto).doesNotContainKey("pagos.auth");
    }
}
