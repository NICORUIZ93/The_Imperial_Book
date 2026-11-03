package academia.pedidos;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;

@Entity
public class Pedido {
    @Id @GeneratedValue
    private Long id;
    private String referencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Version
    private long version;

    protected Pedido() {}

    public Pedido(String referencia) { this.referencia = referencia; }
    void asignarCliente(Cliente cliente) { this.cliente = cliente; }
    public Long getId() { return id; }
    public String getReferencia() { return referencia; }
    public Cliente getCliente() { return cliente; }
    public long getVersion() { return version; }
}
