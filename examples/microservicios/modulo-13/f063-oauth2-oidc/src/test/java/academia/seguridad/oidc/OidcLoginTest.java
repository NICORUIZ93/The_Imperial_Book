package academia.seguridad.oidc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.test.web.servlet.MockMvc;

/** No necesita Keycloak: los endpoints del proveedor están escritos en application.yml y aquí no se llaman. */
@SpringBootTest
@AutoConfigureMockMvc
class OidcLoginTest {

    @Autowired MockMvc mvc;

    @Test
    void sinSesionTeMandaAlProveedor() throws Exception {
        mvc.perform(get("/yo"))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("/oauth2/authorization/keycloak"));
    }

    @Test
    void laRedireccionAlProveedorLlevaStateNonceYPkce() throws Exception {
        String destino = mvc.perform(get("/oauth2/authorization/keycloak"))
            .andExpect(status().isFound())
            .andReturn().getResponse().getRedirectedUrl();
        Map<String, String> q = UriComponentsBuilder.fromUriString(destino).build().getQueryParams().toSingleValueMap();
        assertThat(destino).startsWith("http://localhost:8180/realms/tienda/protocol/openid-connect/auth");
        assertThat(q).containsEntry("response_type", "code")
            .containsEntry("client_id", "tienda-web")
            .containsEntry("code_challenge_method", "S256")
            .containsKeys("state", "nonce", "code_challenge");
        assertThat(q.get("scope")).contains("openid");
    }

    @Test
    void conSesionOidcDevuelveLaIdentidadDelIdToken() throws Exception {
        mvc.perform(get("/yo").with(oidcLogin().idToken(t -> t
                .subject("1b9e-ana").claim("preferred_username", "ana").issuer("http://localhost:8180/realms/tienda"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario").value("ana"))
            .andExpect(jsonPath("$.sub").value("1b9e-ana"));
    }
}
