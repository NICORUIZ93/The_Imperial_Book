package academia.reservas;

/** El proveedor respondió 402: la tarjeta no paga. No reintentable. */
public class PagoRechazado extends RuntimeException {
    public PagoRechazado(String motivo) { super("tarjeta rechazada: " + motivo); }
}
