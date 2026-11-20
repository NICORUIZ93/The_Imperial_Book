package academia.mvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** @WebMvcTest levanta solo la capa web: DispatcherServlet, el controlador y Jackson. */
@WebMvcTest(ProductoController.class)
@Import(Catalogo.class)
class ProductoControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void creaUnProductoValidoYDevuelve201ConLocation() throws Exception {
        mvc.perform(post("/productos").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Café de Huila\",\"precio\":32000}"))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/productos/1"))
            .andExpect(jsonPath("$.nombre").value("Café de Huila"));
    }

    @Test
    void rechazaDatosInvalidosCon400SinLlegarAlCatalogo() throws Exception {
        mvc.perform(post("/productos").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"\",\"precio\":-5}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void unIdInexistenteDa404() throws Exception {
        mvc.perform(get("/productos/999")).andExpect(status().isNotFound());
    }

    @Test
    void sinContentTypeJsonDa415() throws Exception {
        mvc.perform(post("/productos").content("nombre=Cafe"))
            .andExpect(status().isUnsupportedMediaType());
    }
}
