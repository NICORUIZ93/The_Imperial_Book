package academia.reservas;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;

/**
 * Módulo 32 · F182 · Actividades: inventario (en memoria; en producción, PostgreSQL), proveedor de pagos por HTTP con
 * Idempotency-Key y el repositorio de reservas. Un 429 o un 5xx lanzan una excepción reintentable.
 */
public class ReservaActividadesImpl implements ReservaActividades {

    private final RestClient pagos;
    private final Map<String, AtomicInteger> libres = new ConcurrentHashMap<>();
    private final Map<String, String> ocupadas = new ConcurrentHashMap<>();
    final Map<String, String> estados = new ConcurrentHashMap<>();

    public ReservaActividadesImpl(RestClient pagos, Map<String, Integer> aforos) {
        this.pagos = pagos;
        aforos.forEach((evento, n) -> libres.put(evento, new AtomicInteger(n)));
    }

    @Override
    public synchronized void reservarPlaza(Reserva r) {
        if (ocupadas.containsKey(r.reservaId())) return; // idempotente: reintento de algo ya hecho
        AtomicInteger n = libres.get(r.eventoId());
        if (n == null || n.get() < 1) throw new SinPlazas(r.eventoId());
        n.decrementAndGet();
        ocupadas.put(r.reservaId(), r.eventoId());
    }

    @Override
    public synchronized void liberarPlaza(Reserva r) {
        String evento = ocupadas.remove(r.reservaId());
        if (evento != null) libres.get(evento).incrementAndGet();
    }

    @Override
    public String cobrar(Reserva r) {
        var respuesta = pagos.post().uri("/cobros").header("Idempotency-Key", "cobro-" + r.reservaId())
                .body(Map.of("reservaId", r.reservaId(), "importe", r.importe(), "tarjeta", r.tarjeta()))
                .retrieve().onStatus(HttpStatusCode::isError, (req, res) -> { }) // tratamos el estado nosotros
                .toEntity(Map.class);
        int estado = respuesta.getStatusCode().value();
        if (estado == 201) return (String) respuesta.getBody().get("cobroId");
        if (estado == 402) throw new PagoRechazado(String.valueOf(respuesta.getBody().get("motivo")));
        throw new IllegalStateException("proveedor respondió " + estado); // reintentable: Temporal aplica backoff
    }

    @Override
    public void reembolsar(String reservaId, String cobroId) {
        var respuesta = pagos.post().uri("/reembolsos").header("Idempotency-Key", "reembolso-" + reservaId)
                .body(Map.of("cobroId", cobroId)).retrieve().onStatus(HttpStatusCode::isError, (req, res) -> { })
                .toBodilessEntity();
        if (respuesta.getStatusCode().value() != 201) throw new IllegalStateException("reembolso respondió " + respuesta.getStatusCode().value());
    }

    @Override
    public void confirmar(Reserva r, String cobroId) {
        if (r.fallarAlConfirmar()) throw new EventoCerrado();
        estados.put(r.reservaId(), "CONFIRMADA");
    }

    @Override
    public void cancelar(Reserva r, String motivo) {
        estados.put(r.reservaId(), "CANCELADA");
    }
}
