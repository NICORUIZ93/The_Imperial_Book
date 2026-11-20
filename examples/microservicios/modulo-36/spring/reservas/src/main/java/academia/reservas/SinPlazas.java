package academia.reservas;

/** No quedan plazas: no tiene sentido reintentar (tipo no reintentable en ReservaWorkflowImpl). */
public class SinPlazas extends RuntimeException {
    public SinPlazas(String eventoId) { super("sin plazas en " + eventoId); }
}
