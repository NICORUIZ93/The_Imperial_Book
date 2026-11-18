package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class PerfilDevTest {
    @Autowired MockMvc mvc;
    @Test void perfilSobrescribeSoloLaClaveDeclarada() throws Exception {
        mvc.perform(get("/perfil"))
                .andExpect(content().string("banner=Desarrollo; entorno=compartido"));
    }
}
