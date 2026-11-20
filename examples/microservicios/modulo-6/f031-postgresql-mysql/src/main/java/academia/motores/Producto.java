package academia.motores;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** La MISMA entidad sirve para los dos motores: JPA abstrae las diferencias de dialecto. */
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // identity en PG, AUTO_INCREMENT en MySQL
    private Long id;
    @Column(nullable = false, length = 20, unique = true)
    private String sku;
    @Column(nullable = false, length = 80)
    private String nombre;
    @Column(nullable = false)
    private int stock;

    protected Producto() { }

    public Producto(String sku, String nombre, int stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.stock = stock;
    }

    public Long getId() { return id; }
    public String getSku() { return sku; }
    public String getNombre() { return nombre; }
    public int getStock() { return stock; }
}
