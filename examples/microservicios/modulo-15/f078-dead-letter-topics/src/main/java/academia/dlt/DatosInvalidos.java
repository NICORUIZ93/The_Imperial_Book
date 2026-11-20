package academia.dlt;

/** Error PERMANENTE: reintentar no lo arregla (el mensaje está mal). */
public class DatosInvalidos extends RuntimeException {
    public DatosInvalidos(String mensaje) {
        super(mensaje);
    }
}
