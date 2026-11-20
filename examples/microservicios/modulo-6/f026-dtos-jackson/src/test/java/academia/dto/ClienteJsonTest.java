package academia.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
class ClienteJsonTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JsonMapper mapper;   // el mismo JsonMapper (Jackson 3) que usa Spring MVC

    @Test
    void elDtoDeSalidaRenombraYOmiteNulos() {
        var dto = new ClienteResponse(1, "Ana Pérez", "ana@correo.co", null, LocalDate.of(2026, 11, 19));
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"nombre_completo\":\"Ana Pérez\"")
            .contains("\"cliente_desde\":\"19/11/2026\"")
            .doesNotContain("telefono");
    }

    @Test
    void laApiNuncaDevuelveLaClaveNiDatosInternos() throws Exception {
        mvc.perform(post("/clientes").contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nombre_completo":"Ana Pérez","email":"ana@correo.co","clave":"secreta123"}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.nombre_completo").value("Ana Pérez"))
            .andExpect(jsonPath("$.clave").doesNotExist())
            .andExpect(jsonPath("$.hashClave").doesNotExist())
            .andExpect(jsonPath("$.notaInterna").doesNotExist());
    }

    @Test
    void sinJsonPropertyElCampoNoSeLlenaYLaValidacionLoRechaza() throws Exception {
        // "nombreCompleto" (camelCase) no coincide con "nombre_completo": llega null y @NotBlank falla.
        mvc.perform(post("/clientes").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombreCompleto\":\"Ana\",\"email\":\"ana@correo.co\",\"clave\":\"secreta123\"}"))
            .andExpect(status().isBadRequest());
    }
}
