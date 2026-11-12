package academia.rutaflow.cancel.entrega;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Envio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EstadoEnvio estado;

    protected Envio() {}

    private Envio(EstadoEnvio estado) {
        this.estado = estado;
    }

    public static Envio crear() {
        return new Envio(EstadoEnvio.CREADO);
    }

    public Long getId() {
        return id;
    }

    public EstadoEnvio getEstado() {
        return estado;
    }

    public void cancelar() {
        this.estado = EstadoEnvio.CANCELADO;
    }
}
