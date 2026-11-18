package academia.rutaflow.cancel.entrega;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CancelacionContratoTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    EnvioRepository envios;

    @Test
    void deleteMarcaCanceladoYConservaLaFila() throws Exception {
        long id = crearEnvio();

        mockMvc.perform(delete("/api/envios/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(id))
            .andExpect(jsonPath("$.estado").value("CANCELADO"));

        assertThat(envios.findById(id)).isPresent()
            .get().extracting(Envio::getEstado).isEqualTo(EstadoEnvio.CANCELADO);
    }

    @Test
    void repetirDeleteConservaLaMismaCancelacion() throws Exception {
        long id = crearEnvio();

        mockMvc.perform(delete("/api/envios/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("CANCELADO"));
        mockMvc.perform(delete("/api/envios/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("CANCELADO"));
    }

    @Test
    void crearPublicaLocationYGetRecuperaElDto() throws Exception {
        MvcResult creada = mockMvc.perform(post("/api/envios"))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.estado").value("CREADO"))
            .andReturn();
        long id = ((Number) JsonPath.read(creada.getResponse().getContentAsString(), "$.id")).longValue();

        mockMvc.perform(get("/api/envios/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(id))
            .andExpect(jsonPath("$.estado").value("CREADO"));
    }

    private long crearEnvio() throws Exception {
        MvcResult creada = mockMvc.perform(post("/api/envios"))
            .andExpect(status().isCreated())
            .andReturn();
        return ((Number) JsonPath.read(creada.getResponse().getContentAsString(), "$.id")).longValue();
    }
}
