package academia.rutaflow.modulith.notificaciones;

import academia.rutaflow.modulith.pedidos.PedidosService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.util.List;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class NotificacionesModuleTest {
    @Autowired PedidosService pedidos;
    @Autowired BandejaNotificaciones bandeja;

    @Test
    void pedidoCreadoActivaAvisoEnElModuloDependiente() {
        pedidos.crear("RF-204");
        await().atMost(Duration.ofSeconds(2)).untilAsserted(() -> {
            List<String> avisos = bandeja.todos();
            assertFalse(avisos.isEmpty());
            assertEquals("Pedido recibido: RF-204", avisos.getFirst());
        });
        assertEquals("Pedido recibido: RF-204", bandeja.todos().getFirst());
    }
}
