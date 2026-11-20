package academia.observabilidad.metricas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.micrometer.metrics.test.autoconfigure.AutoConfigureMetrics;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** @AutoConfigureMetrics: en los tests Spring Boot no crea el registro Prometheus si no se lo pides. */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureMetrics
class ActuatorPrometheusTest {

    @Autowired MockMvc mvc;

    @Test
    void publicaRedYMetricaDeNegocioConEtiquetasAcotadas() throws Exception {
        mvc.perform(get("/pedidos/7")).andExpect(status().isOk());
        mvc.perform(get("/pedidos/8")).andExpect(status().isOk());
        mvc.perform(post("/pedidos").param("canal", "web")).andExpect(status().isCreated());
        mvc.perform(post("/pedidos").param("canal", "un-valor-inventado-123")).andExpect(status().isCreated());

        String scrape = mvc.perform(get("/actuator/prometheus")).andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        assertThat(scrape).containsPattern("http_server_requests_seconds_count\\{[^}]*uri=\"/pedidos/\\{id\\}\"[^}]*\\} 2(\\.0)?\\n");
        assertThat(scrape).doesNotContain("uri=\"/pedidos/7\"");                    // la plantilla, nunca el id
        assertThat(scrape).containsPattern("http_server_requests_seconds_bucket\\{[^}]*le=\"0\\.5\"");
        assertThat(scrape).containsPattern("pedidos_creados_total\\{application=\"f070-pedidos\",canal=\"web\"\\} 1(\\.0)?\\n");
        assertThat(scrape).containsPattern("pedidos_creados_total\\{[^}]*canal=\"otro\"[^}]*\\} 1(\\.0)?\\n");
        assertThat(scrape).doesNotContain("un-valor-inventado-123");
    }
}
