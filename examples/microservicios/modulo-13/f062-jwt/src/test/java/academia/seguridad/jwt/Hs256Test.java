package academia.seguridad.jwt;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "tienda.jwt.secreto=" + Hs256Test.SECRETO)
@AutoConfigureMockMvc
@ActiveProfiles("hs256")
class Hs256Test {

    static final String SECRETO = "un-secreto-de-al-menos-32-bytes-para-hs256!";

    @Autowired MockMvc mvc;

    @Test
    void elMismoSecretoQueFirmaVerifica() throws Exception {
        mvc.perform(get("/pedidos/mios").header("Authorization", "Bearer " + FabricaDeTokens.hs256(SECRETO, "pedidos")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.alg").value("HS256"));
    }

    @Test
    void otroSecretoSeRechaza() throws Exception {
        String ajeno = FabricaDeTokens.hs256("otro-secreto-de-al-menos-32-bytes-distinto!", "pedidos");
        mvc.perform(get("/pedidos/mios").header("Authorization", "Bearer " + ajeno))
            .andExpect(status().isUnauthorized());
    }
}
