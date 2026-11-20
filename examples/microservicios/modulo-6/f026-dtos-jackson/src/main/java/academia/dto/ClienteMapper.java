package academia.dto;

import java.time.LocalDate;

/** Traduce entre el modelo interno y los DTO. Un solo lugar para decidir qué sale. */
public final class ClienteMapper {
    private ClienteMapper() { }

    public static Cliente aModelo(long id, CrearClienteRequest req, String hashClave, LocalDate hoy) {
        return new Cliente(id, req.nombreCompleto(), req.email(), hashClave, req.telefono(), hoy, "nuevo");
    }

    public static ClienteResponse aRespuesta(Cliente c) {
        return new ClienteResponse(c.getId(), c.getNombreCompleto(), c.getEmail(), c.getTelefono(), c.getFechaRegistro());
    }
}
