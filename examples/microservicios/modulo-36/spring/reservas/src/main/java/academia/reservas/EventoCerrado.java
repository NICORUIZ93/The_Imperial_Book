package academia.reservas;

/** El organizador canceló el evento al confirmar: obliga a reembolsar y liberar. No reintentable. */
public class EventoCerrado extends RuntimeException {
    public EventoCerrado() { super("el organizador canceló el evento"); }
}
