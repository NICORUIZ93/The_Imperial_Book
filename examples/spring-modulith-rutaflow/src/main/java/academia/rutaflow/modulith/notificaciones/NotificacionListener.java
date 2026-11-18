package academia.rutaflow.modulith.notificaciones;

import academia.rutaflow.modulith.pedidos.PedidoCreado;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
public class NotificacionListener {
    private final BandejaNotificaciones bandeja;

    public NotificacionListener(BandejaNotificaciones bandeja) {
        this.bandeja = bandeja;
    }

    @ApplicationModuleListener
    void on(PedidoCreado event) {
        bandeja.agregar(event.pedidoId());
    }
}
