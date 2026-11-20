package academia.decision;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SyncAsyncTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    Notificador notificador;

    @Test
    void elSincronoEsperaAlServicioLento() throws Exception {
        long inicio = System.nanoTime();
        mvc.perform(post("/pedidos/S-1/sincrono")).andExpect(status().isCreated());
        assertThat((System.nanoTime() - inicio) / 1_000_000).isGreaterThanOrEqualTo(300);
    }

    @Test
    void elAsincronoRespondeAntesYElTrabajoTerminaDespues() throws Exception {
        int antes = notificador.enviados();
        long inicio = System.nanoTime();
        mvc.perform(post("/pedidos/A-1/asincrono")).andExpect(status().isAccepted());
        assertThat((System.nanoTime() - inicio) / 1_000_000).isLessThan(250);
        Thread.sleep(600);   // el hilo de @Async termina su trabajo
        assertThat(notificador.enviados()).isGreaterThan(antes);
    }
}
