package academia.seguridad.jwt;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.startsWith;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class Rs256Test {

    @Autowired MockMvc mvc;

    ResultActions pedir(String token) throws Exception {
        return mvc.perform(get("/pedidos/mios").header("Authorization", "Bearer " + token));
    }

    @Test
    void unTokenRs256ValidoPasa() throws Exception {
        pedir(FabricaDeTokens.rs256("pedidos", Instant.now().plusSeconds(300)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sub").value("ana"))
            .andExpect(jsonPath("$.alg").value("RS256"));
    }

    @Test
    void sinTokenResponde401() throws Exception {
        mvc.perform(get("/pedidos/mios"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", "Bearer"));
    }

    @Test
    void otraAudienciaResponde401() throws Exception {
        pedir(FabricaDeTokens.rs256("pagos", Instant.now().plusSeconds(300)))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", startsWith("Bearer error=\"invalid_token\"")));
    }

    @Test
    void tokenVencidoResponde401() throws Exception {
        pedir(FabricaDeTokens.rs256("pedidos", Instant.now().minusSeconds(120)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void algNoneSeRechaza() throws Exception {
        pedir(FabricaDeTokens.algNone()).andExpect(status().isUnauthorized());
    }

    @Test
    void confusionDeAlgoritmoSeRechaza() throws Exception {
        pedir(FabricaDeTokens.confusionHs256()).andExpect(status().isUnauthorized());
    }
}
