package academia.seguridad.cadena;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Documenta el ANTES: con el perfil "antes" cualquiera entra al panel de administración. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("antes")
class CadenaVulnerableTest {

    @Autowired MockMvc mvc;

    @Test
    void conLaCadenaVulnerableUnAnonimoEntraAlPanel() throws Exception {
        mvc.perform(get("/admin/panel")).andExpect(status().isOk());
    }
}
