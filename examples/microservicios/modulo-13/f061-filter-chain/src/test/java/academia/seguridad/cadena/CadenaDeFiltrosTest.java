package academia.seguridad.cadena;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class CadenaDeFiltrosTest {

    @Autowired MockMvc mvc;
    @Autowired FilterChainProxy filterChainProxy;

    @Test
    void lasRutasPublicasNoPidenCredenciales() throws Exception {
        mvc.perform(get("/publico/hola")).andExpect(status().isOk());
    }

    @Test
    void sinCredencialesResponde401ConDesafioBasic() throws Exception {
        mvc.perform(get("/admin/panel"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", "Basic realm=\"Realm\""));
    }

    @Test
    void autenticadoSinElRolResponde403() throws Exception {
        mvc.perform(get("/admin/panel").with(httpBasic("ana", "clave-ana")))
            .andExpect(status().isForbidden());
    }

    @Test
    void conElRolAdminPasaYElFiltroPropioAudita() throws Exception {
        mvc.perform(get("/admin/panel").with(httpBasic("root", "clave-root")))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Auditado-Por", "root"))
            .andExpect(jsonPath("$.panel").value("ventas del día: 42"));
    }

    @Test
    void elFiltroPropioQuedaEntreLaAutenticacionYLaAutorizacion() {
        List<String> filtros = filterChainProxy.getFilterChains().get(0).getFilters().stream()
            .map(f -> f.getClass().getSimpleName()).toList();
        assertThat(filtros).containsSubsequence(
            "SecurityContextHolderFilter", "CsrfFilter", "BasicAuthenticationFilter",
            "ExceptionTranslationFilter", "AuditoriaFilter", "AuthorizationFilter");
        assertThat(filtros.getLast()).isEqualTo("AuthorizationFilter");
    }
}
