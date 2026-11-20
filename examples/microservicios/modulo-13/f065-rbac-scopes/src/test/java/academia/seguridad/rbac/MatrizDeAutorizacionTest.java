package academia.seguridad.rbac;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** La tabla esperada es la misma que imprime jdk/RbacScopes.java. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TokensDePrueba.class)
class MatrizDeAutorizacionTest {

    @Autowired MockMvc mvc;

    @ParameterizedTest(name = "{0} {1} con {2} -> {3}")
    @CsvSource({
        "GET,    /pedidos,             ,           401",
        "GET,    /pedidos,             ana-web,    200",
        "POST,   /pedidos,             ana-web,    201",
        "POST,   /pedidos/7/reembolso, ana-web,    403",
        "DELETE, /pedidos/7,           ana-web,    403",
        "GET,    /pedidos,             ana-widget, 200",
        "POST,   /pedidos,             ana-widget, 403",
        "GET,    /pedidos,             sofia,      200",
        "POST,   /pedidos,             sofia,      403",
        "POST,   /pedidos/7/reembolso, sofia,      200",
        "DELETE, /pedidos/7,           sofia,      403",
        "DELETE, /pedidos/7,           root,       204",
    })
    void decide(String metodo, String ruta, String token, int esperado) throws Exception {
        MockHttpServletRequestBuilder req = request(HttpMethod.valueOf(metodo), ruta);
        if (token != null) req.header("Authorization", "Bearer " + token);
        mvc.perform(req).andExpect(status().is(esperado));
    }
}
