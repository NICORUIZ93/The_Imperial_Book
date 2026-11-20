package academia.modulith.inventario;

import static org.assertj.core.api.Assertions.assertThat;

import academia.modulith.pedidos.PedidoCompletado;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.Scenario;

/** Arranca SOLO el módulo inventario (modo STANDALONE) y le publica el evento de pedidos. */
@ApplicationModuleTest
class InventarioTest {

    @Autowired
    Inventario inventario;

    @Test
    void reservaStockCuandoSeCompletaUnPedido(Scenario escenario) {
        escenario.publish(new PedidoCompletado("P-1", "CAFE-500G", 3))
                .andWaitForStateChange(() -> inventario.reservadoDe("CAFE-500G"), reservado -> reservado > 0)
                .andVerify(reservado -> assertThat(reservado).isEqualTo(3));
    }
}
