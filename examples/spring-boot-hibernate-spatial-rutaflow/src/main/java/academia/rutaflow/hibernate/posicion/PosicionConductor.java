package academia.rutaflow.hibernate.posicion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Version;
import org.locationtech.jts.geom.Point;

@Entity
public class PosicionConductor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "POINT SRID 4326")
    private Point ubicacion;

    @Version
    private Long version;

    protected PosicionConductor() {}

    public PosicionConductor(Point ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Long getId() {
        return id;
    }

    public Point getUbicacion() {
        return ubicacion;
    }

    public Long getVersion() {
        return version;
    }

    public void actualizarUbicacion(Point nueva) {
        this.ubicacion = nueva;
    }
}
