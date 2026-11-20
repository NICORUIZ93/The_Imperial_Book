package academia.nativo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.TypeHint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class NativoTest {

    @Autowired
    MockMvc mvc;

    @Test
    void enLaJvmElEndpointFunciona() throws Exception {
        mvc.perform(get("/impuesto").param("base", "100000"))
            .andExpect(jsonPath("$.impuesto").value(19000))
            .andExpect(jsonPath("$.calculadora").value("CalculadoraIva"));
    }

    @Test
    void elRegistrarDeclaraLaReflexionQueNecesitaElBinario() {
        RuntimeHints hints = new RuntimeHints();
        new ImpuestosHints().registerHints(hints, getClass().getClassLoader());
        TypeHint pista = hints.reflection().getTypeHint(CalculadoraIva.class);
        assertThat(pista).isNotNull();
        assertThat(pista.getMemberCategories()).contains(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
    }
}
