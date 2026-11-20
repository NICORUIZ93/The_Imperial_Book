package academia.facturacion;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** Requiere el PostgreSQL de docker-compose.yml (ver README): docker compose up -d --wait */
@SpringBootTest
@AutoConfigureMockMvc
class BdPorServicioTest {

    @Autowired
    MockMvc mvc;

    @Test
    void facturacionRespondeConSusPropiosDatos() throws Exception {
        mvc.perform(get("/facturas/E-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalCop").value(8126))
            .andExpect(jsonPath("$.estadoEnvio").value("ENTREGADO"));
    }

    @Test
    void facturacionNoPuedeEntrarALaBaseDeEnvios() {
        assertThatThrownBy(() -> DriverManager.getConnection(
                "jdbc:postgresql://localhost:5432/envios_db", "svc_facturacion", "facturacion").close())
            .isInstanceOf(SQLException.class)
            .hasMessageContaining("permission denied for database \"envios_db\"");
    }
}
