package academia.errores;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)   // incluye automáticamente los @ControllerAdvice
class ManejadorGlobalTest {

    @Autowired
    MockMvc mvc;

    @Test
    void productoInexistenteDevuelveProblemDetail404() throws Exception {
        mvc.perform(get("/productos/XYZ-9"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.title").value("Producto no encontrado"))
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.sku").value("XYZ-9"));
    }

    @Test
    void validacionDevuelveLosCamposInvalidos() throws Exception {
        mvc.perform(post("/productos").contentType(MediaType.APPLICATION_JSON)
                .content("{\"sku\":\"\",\"precio\":0}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Datos inválidos"))
            .andExpect(jsonPath("$.errores.sku").exists())
            .andExpect(jsonPath("$.errores.precio").exists());
    }

    @Test
    void unErrorInesperadoNoFiltraDetallesInternos() throws Exception {
        mvc.perform(get("/productos/CAF-1/fallo"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string(not(containsString("password"))));
    }
}
