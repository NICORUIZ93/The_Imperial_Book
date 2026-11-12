package com.example.demo;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.LivenessState;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DisponibilidadProbesTest {
    @Autowired MockMvc mockMvc;
    @Autowired ApplicationContext context;
    @Autowired ServicioExterno servicioExterno;
    @Autowired JwtService jwtService;

    @BeforeEach
    @AfterEach
    void restableceEstados() {
        servicioExterno.marcarComoDisponible();
        AvailabilityChangeEvent.publish(context, ReadinessState.ACCEPTING_TRAFFIC);
        AvailabilityChangeEvent.publish(context, LivenessState.CORRECT);
    }

    @Test
    void unaPasarelaCaidaSoloRetiraLaInstanciaDeReadiness() throws Exception {
        servicioExterno.marcarComoNoDisponible();
        mockMvc.perform(get("/actuator/health/readiness").header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.components.pasarelaPagos.status").value("DOWN"));
        mockMvc.perform(get("/actuator/health/liveness").header("Authorization", bearer()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void rechazarTraficoNoRompeLiveness() throws Exception {
        AvailabilityChangeEvent.publish(context, ReadinessState.REFUSING_TRAFFIC);
        mockMvc.perform(get("/actuator/health/readiness").header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable());
        mockMvc.perform(get("/actuator/health/liveness").header("Authorization", bearer()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void procesoRotoAfectaLivenessPeroNoElEstadoReadiness() throws Exception {
        AvailabilityChangeEvent.publish(context, LivenessState.BROKEN);
        mockMvc.perform(get("/actuator/health/liveness").header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable());
        mockMvc.perform(get("/actuator/health/readiness").header("Authorization", bearer()))
            .andExpect(status().isOk());
    }

    @Test
    void lasDosRutasSiguenProtegidas() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/health/liveness")).andExpect(status().isUnauthorized());
    }

    private String bearer() {
        return "Bearer " + jwtService.generar("monitor@rutaflow.dev", "ADMIN");
    }
}
