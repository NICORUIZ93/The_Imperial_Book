package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.jayway.jsonpath.JsonPath.read;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TareaFlowEndToEndTest {
    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;

    @Test
    void creaConJwtYLeeLaTareaPersistida() throws Exception {
        String token = jwtService.generar("curso@rutaflow.dev", "DRIVER");

        MvcResult creada = mockMvc.perform(post("/api/tareas")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"titulo\":\"Caja térmica\",\"prioridad\":2}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.titulo").value("Caja térmica"))
            .andReturn();

        String id = read(creada.getResponse().getContentAsString(), "$.id").toString();
        mockMvc.perform(get("/api/tareas/{id}", id)
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(Long.parseLong(id)))
            .andExpect(jsonPath("$.titulo").value("Caja térmica"));
    }
}
