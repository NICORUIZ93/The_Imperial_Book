package academia.pruebas;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Test de la CAPA WEB: @WebMvcTest arranca solo Spring MVC (DispatcherServlet, controller, Jackson)
 * sin Tomcat ni servicios reales. El servicio es un @MockitoBean.
 */
@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean CatalogoServicio servicio;

    @Test
    void devuelve200ConElJsonDeLaCotizacion() throws Exception {
        given(servicio.cotizar(1, 10)).willReturn(new Cotizacion(1, 10, 900));

        mvc.perform(get("/productos/1/cotizacion").param("cantidad", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.total").value(900))
                .andExpect(jsonPath("$.cantidad").value(10));
    }

    @Test
    void productoInexistenteEs404() throws Exception {
        given(servicio.cotizar(99, 1)).willThrow(new ProductoNoEncontrado(99));

        mvc.perform(get("/productos/99/cotizacion").param("cantidad", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void sinElParametroCantidadEs400() throws Exception {
        mvc.perform(get("/productos/1/cotizacion"))
                .andExpect(status().isBadRequest());
    }
}
