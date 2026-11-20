package academia.factores;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.bind.validation.BindValidationException;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** Las propiedades del test hacen el papel de las variables de entorno de cada despliegue. */
@SpringBootTest(properties = {"tienda.moneda=USD", "tienda.descuento-maximo=25"})
@AutoConfigureMockMvc
class DoceFactoresTest {

    @Autowired
    MockMvc mvc;

    @Test
    void laConfiguracionVieneDelEntornoNoDelCodigo() throws Exception {
        mvc.perform(get("/config"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.moneda").value("USD"))
            .andExpect(jsonPath("$.descuentoMaximo").value(25));
    }

    @Test
    void elHealthEstaDisponibleParaElOrquestador() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void unaConfiguracionInvalidaImpideArrancar() {
        assertThatThrownBy(() -> new SpringApplicationBuilder(DoceFactoresApp.class)
                .properties("server.port=0", "tienda.moneda=pesos").run().close())
            .hasRootCauseInstanceOf(BindValidationException.class);
    }
}
