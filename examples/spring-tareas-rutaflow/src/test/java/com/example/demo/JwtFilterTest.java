package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JwtFilterTest {
    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;

    @Test
    void sinTokenResponde401() throws Exception {
        mockMvc.perform(delete("/api/entregas/42")).andExpect(status().isUnauthorized());
    }

    @Test
    void rolDriverResponde403() throws Exception {
        String token = jwtService.generar("conductor-7", "DRIVER");
        mockMvc.perform(delete("/api/entregas/42").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void rolAdminResponde200() throws Exception {
        String token = jwtService.generar("admin-1", "ADMIN");
        mockMvc.perform(delete("/api/entregas/42").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    void firmaAlteradaResponde401() throws Exception {
        String[] partes = jwtService.generar("admin-1", "ADMIN").split("\\.");
        String primerCaracter = partes[2].charAt(0) == 'A' ? "B" : "A";
        String tokenAlterado = partes[0] + "." + partes[1] + "." + primerCaracter + partes[2].substring(1);
        mockMvc.perform(delete("/api/entregas/42").header("Authorization", "Bearer " + tokenAlterado))
            .andExpect(status().isUnauthorized());
    }
}
