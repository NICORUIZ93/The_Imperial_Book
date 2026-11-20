import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.function.Consumer;

/**
 * M5 T2 · Saga coreografiada de asignación de conductor. No hay coordinador: cada servicio reacciona a eventos.
 * Envíos -> EnvioCreado -> Flota reserva conductor -> ConductorReservado -> Pagos preautoriza
 *   -> PagoPreautorizado -> Envíos confirma        | PagoRechazado -> Flota libera y Envíos rechaza
 * Uso: java SagaCoreografiada.java                        (flujo feliz)
 *      java SagaCoreografiada.java --pago-rechazado       (compensación por eventos)
 *      java SagaCoreografiada.java --pago-rechazado --olvidar-liberacion  (fallo: Flota no escucha el rechazo)
 */
public final class SagaCoreografiada {
  record Evento(String tipo, String envioId, String dato) {
    @Override public String toString() { return tipo + "(" + envioId + (dato.isEmpty() ? "" : ", " + dato) + ")"; }
  }

  /** Bus en memoria: entrega cada evento a todos los suscritos, en orden de publicación. */
  static final class Bus {
    private final Map<String, List<Map.Entry<String, Consumer<Evento>>>> suscritos = new HashMap<>();
    private final Queue<Evento> pendientes = new ArrayDeque<>();
    private int secuencia = 0;

    void suscribir(String tipo, String servicio, Consumer<Evento> accion) {
      suscritos.computeIfAbsent(tipo, t -> new ArrayList<>()).add(Map.entry(servicio, accion));
    }

    void publicar(Evento e) { pendientes.add(e); }

    void entregarTodo() {
      while (!pendientes.isEmpty()) {
        Evento e = pendientes.poll();
        var destinos = suscritos.getOrDefault(e.tipo(), List.of());
        System.out.printf("%2d %-38s -> %s%n", ++secuencia, e,
            destinos.isEmpty() ? "(nadie escucha)" : destinos.stream().map(Map.Entry::getKey).toList());
        destinos.forEach(d -> d.getValue().accept(e));
      }
    }
  }

  public static void main(String[] args) {
    boolean pagoRechazado = List.of(args).contains("--pago-rechazado");
    boolean olvidarLiberacion = List.of(args).contains("--olvidar-liberacion");
    var bus = new Bus();

    // --- Envíos: dueño del estado del envío. PENDIENTE_ASIGNACION es un bloqueo semántico visible.
    Map<String, String> estadoEnvio = new TreeMap<>();
    bus.suscribir("PagoPreautorizado", "Envios", e -> estadoEnvio.put(e.envioId(), "CONFIRMADO"));
    bus.suscribir("PagoRechazado", "Envios", e -> estadoEnvio.put(e.envioId(), "RECHAZADO"));
    bus.suscribir("SinConductor", "Envios", e -> estadoEnvio.put(e.envioId(), "RECHAZADO"));

    // --- Flota: reserva y libera conductores.
    Map<String, String> reservas = new TreeMap<>(); // conductor -> envío
    TreeSet<String> libres = new TreeSet<>(List.of("C-7"));
    bus.suscribir("EnvioCreado", "Flota", e -> {
      if (libres.isEmpty()) { bus.publicar(new Evento("SinConductor", e.envioId(), "")); return; }
      String conductor = libres.pollFirst();
      reservas.put(conductor, e.envioId());
      bus.publicar(new Evento("ConductorReservado", e.envioId(), conductor));
    });
    if (!olvidarLiberacion) {
      bus.suscribir("PagoRechazado", "Flota", e -> {
        reservas.entrySet().removeIf(r -> {
          if (!r.getValue().equals(e.envioId())) return false;
          libres.add(r.getKey());
          bus.publicar(new Evento("ConductorLiberado", e.envioId(), r.getKey()));
          return true;
        });
      });
    }

    // --- Pagos: preautoriza el cobro del cliente.
    bus.suscribir("ConductorReservado", "Pagos", e -> bus.publicar(pagoRechazado
        ? new Evento("PagoRechazado", e.envioId(), "cupo de credito agotado")
        : new Evento("PagoPreautorizado", e.envioId(), "8126 COP")));

    estadoEnvio.put("E-1", "PENDIENTE_ASIGNACION");
    bus.publicar(new Evento("EnvioCreado", "E-1", ""));
    bus.entregarTodo();

    System.out.println("estado envios=" + estadoEnvio + " reservas=" + reservas + " libres=" + libres);
    reservas.forEach((conductor, envio) -> {
      if (!"CONFIRMADO".equals(estadoEnvio.get(envio)))
        System.out.println("INCONSISTENTE: " + conductor + " reservado para " + envio + " en estado " + estadoEnvio.get(envio));
    });
  }
}
