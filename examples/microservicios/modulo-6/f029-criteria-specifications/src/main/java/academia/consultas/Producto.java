package academia.consultas;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80)
    private String nombre;
    @Column(nullable = false, length = 30)
    private String categoria;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;
    private boolean activo;

    protected Producto() { }

    public Producto(String nombre, String categoria, BigDecimal precio, boolean activo) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.activo = activo;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCategoria() { return categoria; }
    public BigDecimal getPrecio() { return precio; }
    public boolean isActivo() { return activo; }
}
