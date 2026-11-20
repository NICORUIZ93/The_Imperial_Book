package academia.modulith.inventario;

import academia.modulith.pedidos.PedidoCompletado;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;

/**
 * Módulo inventario: reacciona al evento de pedidos sin llamarlo ni conocer sus clases internas.
 * Depende solo del tipo PedidoCompletado (API publicada de pedidos).
 */
@Service
public class Inventario {

    private static final Logger log = LoggerFactory.getLogger(Inventario.class);
    private final Map<String, Integer> reservado = new ConcurrentHashMap<>();

    @ApplicationModuleListener
    void on(PedidoCompletado evento) {
        reservado.merge(evento.sku(), evento.cantidad(), Integer::sum);
        log.info("Reservadas {} unidades de {} para {}", evento.cantidad(), evento.sku(), evento.pedidoId());
    }

    public int reservadoDe(String sku) {
        return reservado.getOrDefault(sku, 0);
    }
}
