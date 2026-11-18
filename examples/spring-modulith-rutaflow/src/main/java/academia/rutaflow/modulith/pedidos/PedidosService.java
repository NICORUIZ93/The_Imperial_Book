package academia.rutaflow.modulith.pedidos;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidosService {
    private final ApplicationEventPublisher events;

    public PedidosService(ApplicationEventPublisher events) {
        this.events = events;
    }

    @Transactional
    public void crear(String pedidoId) {
        events.publishEvent(new PedidoCreado(pedidoId));
    }
}
