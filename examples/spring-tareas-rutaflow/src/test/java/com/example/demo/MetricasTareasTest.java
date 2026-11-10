package com.example.demo;

import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MetricasTareasTest {
    @Autowired MockMvc mockMvc;
    @Autowired MeterRegistry registry;
    @Autowired JwtService jwtService;

    @Test
    void crearTareaIncrementaContadorYSePublicaEnActuator() throws Exception {
        double antes = registry.find("rutaflow.tareas.creadas")
            .tag("origen", "api").counter().count();
        String token = "Bearer " + jwtService.generar("metricas@rutaflow.dev", "ADMIN");

        mockMvc.perform(post("/api/tareas")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"titulo\":\"Paquete frágil\",\"prioridad\":2}"))
            .andExpect(status().isCreated());

        assertThat(registry.find("rutaflow.tareas.creadas")
            .tag("origen", "api").counter().count()).isEqualTo(antes + 1);

        mockMvc.perform(get("/actuator/metrics/rutaflow.tareas.creadas")
                .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("rutaflow.tareas.creadas"))
            .andExpect(jsonPath("$.availableTags[0].tag").value("origen"))
            .andExpect(jsonPath("$.availableTags[0].values[0]").value("api"))
            .andExpect(jsonPath("$.measurements[0].value").value(antes + 1));
    }

    @Test
    void endpointMetricsRequiereAutenticacion() throws Exception {
        mockMvc.perform(get("/actuator/metrics/rutaflow.tareas.creadas"))
            .andExpect(status().isUnauthorized());
    }
}
