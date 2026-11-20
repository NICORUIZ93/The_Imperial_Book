package academia.seguridad.keycloak;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TokensDePrueba.class)
class ResourceServerKeycloakTest {

    @Autowired MockMvc mvc;

    @Test
    void anaConRolClienteVeSusPedidosConSuNombre() throws Exception {
        mvc.perform(get("/pedidos").header("Authorization", "Bearer token-ana"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario").value("ana"));
    }

    @Test
    void anaNoEntraAAdmin() throws Exception {
        mvc.perform(get("/admin/reportes").header("Authorization", "Bearer token-ana"))
            .andExpect(status().isForbidden());
    }

    @Test
    void rootConRolAdminEntraAAdmin() throws Exception {
        mvc.perform(get("/admin/reportes").header("Authorization", "Bearer token-root"))
            .andExpect(status().isOk());
    }

    @Test
    void sinRolesDelRealmNoHayAcceso() throws Exception {
        mvc.perform(get("/pedidos").header("Authorization", "Bearer token-sin-roles"))
            .andExpect(status().isForbidden());
    }

    @Test
    void tokenDesconocidoEs401() throws Exception {
        mvc.perform(get("/pedidos").header("Authorization", "Bearer inventado"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void elConversorLeeRealmAccessRoles() {
        Jwt jwt = Jwt.withTokenValue("t").header("alg", "RS256").subject("x")
            .claim("realm_access", Map.of("roles", List.of("cliente", "soporte")))
            .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        assertThat(new RolesDeKeycloak().convert(jwt))
            .extracting(Object::toString)
            .containsExactlyInAnyOrder("ROLE_cliente", "ROLE_soporte");
    }
}
