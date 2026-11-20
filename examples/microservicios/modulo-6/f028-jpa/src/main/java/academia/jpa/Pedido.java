package academia.jpa;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Entidad raíz: un pedido con sus líneas (relación 1 a N bidireccional). */
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // la BD asigna el id (columna identity)
    private Long id;

    @Column(nullable = false, length = 80)
    private String cliente;

    @Enumerated(EnumType.STRING)                           // guarda "NUEVO", no 0
    @Column(nullable = false, length = 20)
    private EstadoPedido estado = EstadoPedido.NUEVO;

    // mappedBy: el dueño de la relación es LineaPedido.pedido (tiene la FK).
    // cascade ALL + orphanRemoval: las líneas viven y mueren con su pedido.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaPedido> lineas = new ArrayList<>();

    @Version                                               // bloqueo optimista
    private long version;

    protected Pedido() { }                                 // JPA necesita un constructor sin argumentos

    public Pedido(String cliente) { this.cliente = cliente; }

    public void agregarLinea(String sku, int cantidad, BigDecimal precioUnitario) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("cantidad inválida para " + sku + ": " + cantidad);
        }
        lineas.add(new LineaPedido(this, sku, cantidad, precioUnitario));
    }

    public void confirmar() { this.estado = EstadoPedido.CONFIRMADO; }

    public BigDecimal total() {
        return lineas.stream().map(LineaPedido::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Long getId() { return id; }
    public String getCliente() { return cliente; }
    public EstadoPedido getEstado() { return estado; }
    public List<LineaPedido> getLineas() { return lineas; }
}
