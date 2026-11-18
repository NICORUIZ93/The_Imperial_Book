package academia.rutaflow.transacciones;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class FronteraTransaccionalTest {
    @Autowired
    FronteraTransaccionalService servicio;

    @Test
    void llamadaQueEntraPorElProxyAbreUnaTransaccionReal() {
        assertThat(servicio.transaccionIniciadaPorElProxy()).isTrue();
    }

    @Test
    void thisNoVuelveAEntrarPorElProxy() {
        assertThat(servicio.llamadaInternaConThis()).isFalse();
    }

    @Test
    void llamarOtroBeanSiCruzaElProxy() {
        assertThat(servicio.llamadaEntreBeans()).isTrue();
    }
}
