package academia.rutaflow.integrador.entrega;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "entrega")
public class Entrega {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String destinatario;

    @Column(nullable = false, length = 30)
    private String estado;

    protected Entrega() {}

    private Entrega(String destinatario) {
        this.destinatario = destinatario;
        this.estado = "CREADA";
    }

    public static Entrega crear(String destinatario) {
        return new Entrega(destinatario);
    }

    public Long getId() { return id; }
    public String getDestinatario() { return destinatario; }
    public String getEstado() { return estado; }
}
