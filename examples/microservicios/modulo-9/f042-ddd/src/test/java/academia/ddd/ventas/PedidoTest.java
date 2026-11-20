package academia.ddd.ventas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class PedidoTest {

    private Pedido pedidoConDosLineas() {
        Pedido p = new Pedido("P-1", "CL-1");
        p.agregar("CAFE", 3, new Dinero(32_000));
        p.agregar("TAZA", 4, new Dinero(18_500));
        return p;
    }

    @Test
    void calculaElTotalDesdeSusLineas() {
        assertEquals(new Dinero(170_000), pedidoConDosLineas().total());
    }

    @Test
    void confirmarRegistraUnSoloEventoConLosDatosQueOtrosNecesitan() {
        Pedido p = pedidoConDosLineas();
        p.confirmar("Calle 1");
        assertEquals(List.of(new PedidoConfirmado("P-1", "CL-1", "Calle 1", 170_000, 7)), p.extraerEventos());
        assertTrue(p.extraerEventos().isEmpty(), "los eventos se entregan una sola vez");
    }

    @Test
    void noSePuedeModificarUnPedidoConfirmado() {
        Pedido p = pedidoConDosLineas();
        p.confirmar("Calle 1");
        var e = assertThrows(ReglaDeNegocioViolada.class, () -> p.agregar("FILTRO", 1, new Dinero(9_000)));
        assertEquals("el pedido P-1 ya está CONFIRMADO", e.getMessage());
    }

    @Test
    void noSuperaVeinteUnidadesNiSeConfirmaVacio() {
        Pedido p = new Pedido("P-2", "CL-1");
        assertThrows(ReglaDeNegocioViolada.class, () -> p.confirmar("Calle 1"));
        p.agregar("CAFE", 20, new Dinero(1_000));
        assertThrows(ReglaDeNegocioViolada.class, () -> p.agregar("CAFE", 1, new Dinero(1_000)));
    }

    @Test
    void lasLineasNoSePuedenModificarDesdeFuera() {
        Pedido p = pedidoConDosLineas();
        assertThrows(UnsupportedOperationException.class,
                () -> p.lineas().add(new LineaDePedido("GRATIS", 100, Dinero.CERO)));
    }
}
