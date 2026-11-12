package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RutasEntregaControllerTest {
    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;

    private String bearer() {
        return "Bearer " + jwtService.generar("ana-1", "ADMIN");
    }

    @Test
    void sobreElLimiteDevuelveElApiErrorCompartido() throws Exception {
        mockMvc.perform(post("/api/rutas").param("numeroDeParadas", "21")
                .header("Authorization", bearer()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.codigo").value("LIMITE_PARADAS"))
            .andExpect(jsonPath("$.mensaje")
                .value("El límite de 20 paradas por ruta fue excedido."))
            .andExpect(jsonPath("$.campos").isEmpty());
    }

@Test
void elLimiteExactoDeVeinteParadasEsAceptado() throws Exception {
    mockMvc.perform(post("/api/rutas").param("numeroDeParadas", "20")
            .header("Authorization", bearer()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.estado").value("creada"))
        .andExpect(jsonPath("$.paradas").value(20));
}

}
