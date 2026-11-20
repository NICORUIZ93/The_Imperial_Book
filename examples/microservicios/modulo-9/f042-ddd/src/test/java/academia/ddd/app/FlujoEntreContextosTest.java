package academia.ddd.app;

import static org.assertj.core.api.Assertions.assertThat;

import academia.ddd.envios.PlanificadorDeEnvios;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Con Spring: confirmar en Ventas produce un envío en Envíos sin que Ventas conozca a Envíos. */
@SpringBootTest
class FlujoEntreContextosTest {

    @Autowired
    ServicioDeVentas ventas;

    @Autowired
    PlanificadorDeEnvios envios;

    @Test
    void confirmarUnPedidoPlanificaSuEnvio() {
        ventas.crear("P-7", "CL-3");
        ventas.agregar("P-7", "CAFE", 6, 32_000);
        ventas.confirmar("P-7", "Av. 68 # 10-20");
        assertThat(envios.envios()).singleElement()
                .satisfies(e -> assertThat(e.referenciaVenta()).isEqualTo("P-7"))
                .satisfies(e -> assertThat(e.bultos()).isEqualTo(2));
    }
}
