package academia.catalogo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

/**
 * La configuración llega como la daría Kubernetes (variables ya convertidas a propiedades) y las probes
 * responden a los cambios de estado. Sin Docker ni clúster: corre en segundos.
 */
@SpringBootTest(properties = {"catalogo.color=azul", "catalogo.version=1.0.0", "catalogo.clave-api=secreta"})
@AutoConfigureMockMvc
class CatalogoTest {

    @Autowired MockMvc mvc;

    @Test
    void infoMuestraLaConfiguracionPeroNoElSecreto() throws Exception {
        mvc.perform(get("/api/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value("1.0.0"))
                .andExpect(jsonPath("$.color").value("azul"))
                .andExpect(jsonPath("$.claveApiConfigurada").value(true))
                .andExpect(jsonPath("$.claveApi").doesNotExist());
    }

    @Test
    void lasProbesEstanArribaAlArrancar() throws Exception {
        mvc.perform(get("/actuator/health/liveness")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void readinessRechazandoTraficoDevuelve503YLivenessSigueArriba() throws Exception {
        mvc.perform(post("/admin/readiness/rechazar")).andExpect(status().isOk());
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("OUT_OF_SERVICE"));
        mvc.perform(get("/actuator/health/liveness")).andExpect(status().isOk());
        mvc.perform(post("/admin/readiness/aceptar")).andExpect(status().isOk());
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk());
    }

    @Test
    @DirtiesContext   // la liveness queda rota: Spring descarta este contexto y los demás tests usan uno nuevo
    void livenessRotaDevuelve503() throws Exception {
        mvc.perform(post("/admin/liveness/romper")).andExpect(status().isOk());
        mvc.perform(get("/actuator/health/liveness")).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("DOWN"));
    }

    @Test
    void cpuQuemaElTiempoPedido() throws Exception {
        mvc.perform(get("/api/cpu").param("ms", "50")).andExpect(status().isOk())
                .andExpect(jsonPath("$.ms").value(50));
    }
}
