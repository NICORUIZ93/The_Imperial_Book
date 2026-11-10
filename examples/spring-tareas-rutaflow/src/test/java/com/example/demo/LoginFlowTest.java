package com.example.demo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LoginFlowTest {
    @Autowired MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void loginEntregaTokenQueAbreLaRutaProtegida() throws Exception {
        String body = """
            {"email":"ana@rutaflow.dev","password":"clave-larga-segura"}
            """;
        String respuesta = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode token = mapper.readTree(respuesta).get("token");
        assertTrue(token != null && !token.asText().isBlank());

        mockMvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());
        var protegida = mockMvc.perform(get("/api/usuarios")
                .header("Authorization", "Bearer " + token.asText()))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertEquals("ana@rutaflow.dev", mapper.readTree(protegida).get("email").asText());
        assertEquals("ROLE_ADMIN", mapper.readTree(protegida).get("rol").asText());
    }
}
