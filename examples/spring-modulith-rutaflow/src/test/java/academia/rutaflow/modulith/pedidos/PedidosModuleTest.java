package academia.rutaflow.modulith.pedidos;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;

import java.util.stream.StreamSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ApplicationModuleTest
class PedidosModuleTest {
    @Autowired PedidosService pedidos;

    @Test
    void crearPublicaEventoConIdDelPedido(PublishedEvents events) {
        pedidos.crear("RF-205");

        var publicados = events.ofType(PedidoCreado.class)
                .matchingValue(PedidoCreado::pedidoId, "RF-205");
        assertEquals(1, StreamSupport.stream(publicados.spliterator(), false).count());
    }
}
