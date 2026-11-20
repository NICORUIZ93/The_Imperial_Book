package academia.dto;

import java.time.LocalDate;

/**
 * Modelo INTERNO (en F028 será una entidad JPA). Tiene datos que jamás deben
 * salir por la API: el hash de la clave y una nota interna.
 */
public class Cliente {
    private final long id;
    private final String nombreCompleto;
    private final String email;
    private final String hashClave;
    private final String telefono;
    private final LocalDate fechaRegistro;
    private final String notaInterna;

    public Cliente(long id, String nombreCompleto, String email, String hashClave,
                   String telefono, LocalDate fechaRegistro, String notaInterna) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.hashClave = hashClave;
        this.telefono = telefono;
        this.fechaRegistro = fechaRegistro;
        this.notaInterna = notaInterna;
    }

    public long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getHashClave() { return hashClave; }
    public String getTelefono() { return telefono; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public String getNotaInterna() { return notaInterna; }
}
