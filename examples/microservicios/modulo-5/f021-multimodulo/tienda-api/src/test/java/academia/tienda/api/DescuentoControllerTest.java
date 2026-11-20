package academia.tienda.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DescuentoControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void laApiUsaLaReglaDelModuloDominio() throws Exception {
        mvc.perform(get("/descuentos").param("total", "250000"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.descuento").value(25000));
    }
}
