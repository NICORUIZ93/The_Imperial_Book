package academia.modulith.pedidos;

import academia.modulith.pedidos.interno.CalculadoraDeDescuentos;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** API pública del módulo pedidos. */
@Service
public class Pedidos {

    private final ApplicationEventPublisher eventos;
    private final CalculadoraDeDescuentos descuentos;

    public Pedidos(ApplicationEventPublisher eventos, CalculadoraDeDescuentos descuentos) {
        this.eventos = eventos;
        this.descuentos = descuentos;
    }

    /** El evento sale al confirmar la transacción: si la transacción falla, inventario nunca se entera. */
    @Transactional
    public int completar(String pedidoId, String sku, int cantidad) {
        eventos.publishEvent(new PedidoCompletado(pedidoId, sku, cantidad));
        return descuentos.porcentajePara(cantidad);
    }
}
