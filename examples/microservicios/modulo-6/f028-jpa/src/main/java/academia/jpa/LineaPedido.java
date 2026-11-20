package academia.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "lineas_pedido")
public class LineaPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)   // N líneas -> 1 pedido; carga perezosa
    @JoinColumn(name = "pedido_id")                        // columna FK en lineas_pedido
    private Pedido pedido;

    @Column(nullable = false, length = 20)
    private String sku;

    private int cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    protected LineaPedido() { }

    LineaPedido(Pedido pedido, String sku, int cantidad, BigDecimal precioUnitario) {
        this.pedido = pedido;
        this.sku = sku;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }

    public BigDecimal subtotal() { return precioUnitario.multiply(BigDecimal.valueOf(cantidad)); }

    public String getSku() { return sku; }
    public int getCantidad() { return cantidad; }
}
