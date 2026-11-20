package academia.jpa;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioPedidos {

    private final PedidoRepository pedidos;

    public ServicioPedidos(PedidoRepository pedidos) { this.pedidos = pedidos; }

    /** Todo o nada: si una línea es inválida, también se deshace el INSERT del pedido. */
    @Transactional
    public Long crear(String cliente, List<LineaDto> lineas) {
        Pedido pedido = pedidos.save(new Pedido(cliente));      // INSERT inmediato (id identity)
        lineas.forEach(l -> pedido.agregarLinea(l.sku(), l.cantidad(), l.precio()));
        return pedido.getId();                                   // al salir: INSERT de líneas y COMMIT
    }

    /** Dirty checking: no hay save(); Hibernate detecta el cambio y hace UPDATE al confirmar. */
    @Transactional
    public void confirmar(Long id) {
        pedidos.findById(id).orElseThrow().confirmar();
    }

    @Transactional(readOnly = true)
    public BigDecimal total(Long id) {
        return pedidos.findConLineasById(id).orElseThrow().total();
    }
}
