package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PaginacionTareasTest {
    @Autowired MockMvc mvc;
    @Autowired TareaRepository tareas;
    @Autowired JwtService jwt;

    @Test
    void paginasConsecutivasConservanOrdenYNoRepitenFilas() throws Exception {
        tareas.deleteAll();
        for (int i = 1; i <= 3; i++) {
            tareas.saveAndFlush(new Tarea("Página " + i, 1, "INTERNA"));
        }
        String bearer = "Bearer " + jwt.generar("curso", "ADMIN");
        mvc.perform(get("/api/tareas").param("page", "0").param("size", "2")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].titulo").value("Página 1"))
                .andExpect(jsonPath("$.items[1].titulo").value("Página 2"))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.hasNext").value(true))
                .andExpect(jsonPath("$.items[0].ubicacionInterna").doesNotExist());
        mvc.perform(get("/api/tareas").param("page", "1").param("size", "2")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].titulo").value("Página 3"))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    void limitesDePaginaYTamanioRechazanAbusoConApiError() throws Exception {
        String bearer = "Bearer " + jwt.generar("curso", "ADMIN");
        for (String query : new String[]{"?page=-1", "?page=1001", "?size=0", "?size=51"}) {
            mvc.perform(get("/api/tareas" + query).header("Authorization", bearer))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.codigo").value("VALIDACION"));
        }
        mvc.perform(get("/api/tareas?page=1000&size=50").header("Authorization", bearer))
                .andExpect(status().isOk());
    }
}
