package academia.ddd.envios;

import static org.junit.jupiter.api.Assertions.assertEquals;

import academia.ddd.ventas.PedidoConfirmado;
import org.junit.jupiter.api.Test;

class PlanificadorDeEnviosTest {

    @Test
    void traduceElEventoDeVentasASuPropioModelo() {
        var planificador = new PlanificadorDeEnvios();
        Envio envio = planificador.alConfirmarsePedido(new PedidoConfirmado("P-9", "CL-1", "Calle 9", 50_000, 7));
        assertEquals(new Envio("GUIA-1", "P-9", "Calle 9", 2, Envio.Estado.POR_DESPACHAR), envio);
    }
}
