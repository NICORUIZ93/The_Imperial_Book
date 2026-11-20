package academia.reservas;

/** Datos de una reserva (también es la entrada del workflow: Temporal la serializa en JSON). */
public record Reserva(String reservaId, String eventoId, String clienteId, int importe, String tarjeta, boolean fallarAlConfirmar) { }
