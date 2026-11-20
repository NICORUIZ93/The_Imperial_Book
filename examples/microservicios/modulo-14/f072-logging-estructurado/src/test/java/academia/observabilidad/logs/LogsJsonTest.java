package academia.observabilidad.logs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(OutputCaptureExtension.class)
class LogsJsonTest {

    @Autowired MockMvc mvc;

    static String linea(CapturedOutput salida, String mensaje) {
        List<String> lineas = salida.getOut().lines().filter(l -> l.contains("\"message\":\"" + mensaje + "\"")).toList();
        assertThat(lineas).as("una línea JSON con message=%s", mensaje).hasSize(1);
        return lineas.getFirst();
    }

    @Test
    void cadaEventoEsUnaLineaJsonConCamposConNombre(CapturedOutput salida) throws Exception {
        mvc.perform(post("/pedidos/P-7/pagar").param("canal", "web").param("importe", "32000")
                .param("email", "ana@correo.com"))
            .andExpect(status().isOk());

        String l = linea(salida, "pedido confirmado");
        assertThat(l).startsWith("{").endsWith("}");
        assertThat(l).contains("\"log\":{\"level\":\"INFO\"");
        assertThat(l).contains("\"service\":{\"name\":\"f072-pagos\"");
        assertThat(l).contains("\"pedidoId\":\"P-7\"");          // del MDC
        assertThat(l).contains("\"canal\":\"web\"");             // de addKeyValue
        assertThat(l).doesNotContain("ana@correo.com");           // nunca datos personales
    }

    @Test
    void elRechazoSaleComoWarnConSusCampos(CapturedOutput salida) throws Exception {
        mvc.perform(post("/pedidos/P-9/pagar").param("canal", "app").param("importe", "9000000")
                .param("email", "luis@correo.com"))
            .andExpect(status().isUnprocessableEntity());

        String l = linea(salida, "pago rechazado por tope de importe");
        assertThat(l).contains("\"log\":{\"level\":\"WARN\"").contains("\"pedidoId\":\"P-9\"");
        assertThat(salida.getOut()).doesNotContain("luis@correo.com");
    }
}
