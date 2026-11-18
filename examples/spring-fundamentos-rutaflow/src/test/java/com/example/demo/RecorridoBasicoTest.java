package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RecorridoBasicoTest {
    @Autowired MockMvc mvc;
    @Autowired ServicioReportes reportes;

    @Test
    void conectaLasCapasYConservaConfiguracionBase() throws Exception {
        mvc.perform(get("/envios/RF-42")).andExpect(content().string("En ruta: RF-42"));
        mvc.perform(get("/envios/RF-42/estado")).andExpect(content().string("En ruta: RF-42"));
        mvc.perform(get("/health")).andExpect(status().isOk()).andExpect(content().string("OK"));
        mvc.perform(get("/perfil")).andExpect(content().string("banner=Base; entorno=compartido"));
    }

    @Test
    void providerObtienePrototypesNuevosSinRecrearLaDependenciaDirecta() {
        String[] primera = reportes.comparar().split("; nuevos=");
        String[] segunda = reportes.comparar().split("; nuevos=");
        assertThat(primera[0]).isEqualTo(segunda[0]);
        String[] ids = (primera[1] + "," + segunda[1]).split(",");
        assertThat(ids).doesNotHaveDuplicates().hasSize(4);
    }
}
