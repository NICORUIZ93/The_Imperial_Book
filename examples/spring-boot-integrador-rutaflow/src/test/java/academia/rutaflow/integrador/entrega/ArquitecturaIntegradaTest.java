package academia.rutaflow.integrador.entrega;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import io.micrometer.core.instrument.MeterRegistry;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
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

    @Autowired
    JwtEncoder jwtEncoder;

    @Autowired
    MockMvc mockMvc;

    @Autowired
    MeterRegistry meterRegistry;

    @Autowired
    Flyway flyway;

    @Autowired
    JwtDecoder jwtDecoder;

    @Autowired
    SecurityFilterChain securityFilterChain;

    @Value("${spring.jpa.hibernate.ddl-auto}")
    String ddlAuto;

    @Test
    void postRecorreHttpCapasFlywayYPostgres() throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/entregas"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token("ROLE_USER"))
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
    void contratoDeCreacionConservaStatusLocationYCamposPublicos() throws Exception {
        mockMvc.perform(post("/api/entregas")
                .header("Authorization", "Bearer " + token("ROLE_USER"))
                .contentType("application/json")
                .content("{\"destinatario\":\"Contrato M13\"}"))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/entregas/")))
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.destinatario").value("Contrato M13"))
            .andExpect(jsonPath("$.estado").value("CREADA"));
    }

    @Test
    void contratoDeErrorRechazaDestinatarioVacioSinGuardar() throws Exception {
        long antes = entregas.count();

        mockMvc.perform(post("/api/entregas")
                .header("Authorization", "Bearer " + token("ROLE_USER"))
                .contentType("application/json")
                .content("{\"destinatario\":\" \"}"))
            .andExpect(status().isBadRequest());

        assertThat(entregas.count()).isEqualTo(antes);
    }

    @Test
    void destinatarioVacioSeRechazaAntesDeGuardar() throws Exception {
        long entregasAntes = entregas.count();
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/entregas"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token("ROLE_USER"))
            .POST(HttpRequest.BodyPublishers.ofString("{\"destinatario\":\" \"}", StandardCharsets.UTF_8))
            .build();

        var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(entregas.count()).isEqualTo(entregasAntes);
    }

    @Test
    void escrituraRequiereJwtValidoYRolUser() throws Exception {
        mockMvc.perform(post("/api/entregas").contentType("application/json")
                .content("{\"destinatario\":\"Tienda Norte\"}"))
            .andExpect(status().isUnauthorized());

        String firmado = token("ROLE_USER");
        char ultimo = firmado.charAt(firmado.length() - 1);
        String alterado = firmado.substring(0, firmado.length() - 1) + (ultimo == 'A' ? 'B' : 'A');
        mockMvc.perform(post("/api/entregas").header("Authorization", "Bearer " + alterado)
                .contentType("application/json").content("{\"destinatario\":\"Tienda Norte\"}"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/entregas").header("Authorization", "Bearer " + token("ROLE_ADMIN"))
                .contentType("application/json").content("{\"destinatario\":\"Tienda Norte\"}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void jwtConRolUserCreaYActuatorMuestraElContador() throws Exception {
        double antes = meterRegistry.counter("entregas.creadas").count();

        mockMvc.perform(post("/api/entregas").header("Authorization", "Bearer " + token("ROLE_USER"))
                .contentType("application/json").content("{\"destinatario\":\"Tienda Centro\"}"))
            .andExpect(status().isCreated());

        double despues = meterRegistry.counter("entregas.creadas").count();
        assertThat(despues).isEqualTo(antes + 1.0);

        mockMvc.perform(get("/actuator/metrics/entregas.creadas")
                .header("Authorization", "Bearer " + token("ROLE_USER")))
            .andExpect(status().isForbidden());

        mockMvc.perform(get("/actuator/metrics/entregas.creadas")
                .header("Authorization", "Bearer " + token("ROLE_ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.measurements[0].value").value(despues));
    }

    @Test
    void configuracionFinalMantieneMigracionSeguridadYValidacion() {
        assertThat(ddlAuto).isEqualTo("validate");
        assertThat(flyway.info().current().getScript()).isEqualTo("V1__crear_entrega.sql");
        assertThat(jwtDecoder).isNotNull();
        assertThat(securityFilterChain).isNotNull();
    }

    private String token(String... roles) {
        Instant ahora = Instant.now();
        var claims = JwtClaimsSet.builder()
            .subject("prueba-integrador")
            .issuedAt(ahora)
            .expiresAt(ahora.plusSeconds(300))
            .claim("roles", List.of(roles))
            .build();
        var header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
