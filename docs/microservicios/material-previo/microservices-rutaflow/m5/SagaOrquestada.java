import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

/**
 * M5 T3 · Saga orquestada de asignación con estado persistido y compensación que puede fallar.
 * El orquestador guarda su estado en estado-saga/ después de cada paso; si muere, la siguiente ejecución reanuda.
 *
 * Uso (cada escenario empieza con --reiniciar):
 *   java SagaOrquestada.java --reiniciar                                  flujo feliz
 *   java SagaOrquestada.java --reiniciar --pago-rechazado                 compensación
 *   java SagaOrquestada.java --reiniciar --pago-rechazado --flota-caida=2 la compensación falla 2 veces y se recupera
 *   java SagaOrquestada.java --reiniciar --pago-rechazado --flota-caida=9 agota los intentos: intervención manual
 *   java SagaOrquestada.java --reiniciar --pago-rechazado --respuesta-perdida [--liberar-no-idempotente]
 *   java SagaOrquestada.java --reiniciar --caer-tras=RESERVADO   y después   java SagaOrquestada.java
 */
public final class SagaOrquestada {
  static final Path DIR = Path.of("estado-saga");
  static final int CAPACIDAD_FLOTA = 1;
  static final int MAX_INTENTOS_COMPENSACION = 5;

  static final class FlotaNoDisponible extends RuntimeException {
    FlotaNoDisponible(String m) { super(m); }
  }

  // ---------------- persistencia mínima en archivos .properties
  static Properties cargar(String nombre) throws IOException {
    var p = new Properties();
    Path archivo = DIR.resolve(nombre);
    if (Files.exists(archivo)) try (Reader r = Files.newBufferedReader(archivo, StandardCharsets.UTF_8)) { p.load(r); }
    return p;
  }

  static void guardar(String nombre, Properties p) throws IOException {
    Files.createDirectories(DIR);
    Path tmp = DIR.resolve(nombre + ".tmp");
    try (Writer w = Files.newBufferedWriter(tmp, StandardCharsets.UTF_8)) { p.store(w, null); }
    Files.move(tmp, DIR.resolve(nombre), java.nio.file.StandardCopyOption.REPLACE_EXISTING,
        java.nio.file.StandardCopyOption.ATOMIC_MOVE); // nunca queda un archivo a medio escribir
  }

  // ---------------- participante Flota (su estado también sobrevive entre ejecuciones)
  static final class Flota {
    final Properties p;
    final boolean liberarIdempotente;

    Flota(Properties p, boolean liberarIdempotente) { this.p = p; this.liberarIdempotente = liberarIdempotente; }

    int cupo() { return Integer.parseInt(p.getProperty("cupoLibre")); }
    Set<String> reservas() {
      String r = p.getProperty("reservas", "");
      return new LinkedHashSet<>(r.isEmpty() ? List.of() : List.of(r.split(",")));
    }
    void guardarReservas(Set<String> r) { p.setProperty("reservas", String.join(",", r)); }

    void reservar(String sagaId) {
      Set<String> r = reservas();
      if (r.contains(sagaId)) return; // reintento del mismo paso: sin efecto
      if (cupo() == 0) throw new IllegalStateException("sin conductores libres");
      r.add(sagaId);
      guardarReservas(r);
      p.setProperty("cupoLibre", String.valueOf(cupo() - 1));
    }

    void liberar(String sagaId, boolean perderRespuesta) {
      int fallos = Integer.parseInt(p.getProperty("fallosRestantes", "0"));
      if (fallos > 0) {
        p.setProperty("fallosRestantes", String.valueOf(fallos - 1));
        throw new FlotaNoDisponible("Flota respondio 503");
      }
      Set<String> r = reservas();
      if (liberarIdempotente && !r.contains(sagaId)) {
        System.out.println("   Flota: " + sagaId + " ya estaba liberada, sin efecto");
      } else {
        r.remove(sagaId);
        guardarReservas(r);
        p.setProperty("cupoLibre", String.valueOf(cupo() + 1));
      }
      if (perderRespuesta && !p.containsKey("respuestaYaPerdida")) {
        p.setProperty("respuestaYaPerdida", "true");
        throw new FlotaNoDisponible("timeout: la liberacion se aplico pero la respuesta se perdio");
      }
    }
  }

  public static void main(String[] args) throws IOException {
    List<String> op = List.of(args);
    if (op.contains("--reiniciar") && Files.exists(DIR)) {
      try (var archivos = Files.walk(DIR)) {
        archivos.sorted(Comparator.reverseOrder()).forEach(f -> f.toFile().delete());
      }
    }
    Properties saga = cargar("saga.properties");
    Properties flotaEstado = cargar("flota.properties");
    if (saga.isEmpty()) {
      saga.setProperty("sagaId", "S-E-1");
      saga.setProperty("paso", "INICIO");
      saga.setProperty("intentosCompensacion", "0");
      saga.setProperty("pagoRechazado", String.valueOf(op.contains("--pago-rechazado")));
      saga.setProperty("respuestaPerdida", String.valueOf(op.contains("--respuesta-perdida")));
      flotaEstado.setProperty("cupoLibre", String.valueOf(CAPACIDAD_FLOTA));
      op.stream().filter(a -> a.startsWith("--flota-caida="))
          .forEach(a -> flotaEstado.setProperty("fallosRestantes", a.substring(14)));
      System.out.println("NUEVA saga " + saga.getProperty("sagaId"));
    } else {
      System.out.println("REANUDA saga " + saga.getProperty("sagaId") + " desde " + saga.getProperty("paso"));
    }
    String caerTras = op.stream().filter(a -> a.startsWith("--caer-tras=")).map(a -> a.substring(12)).findFirst().orElse("");
    var flota = new Flota(flotaEstado, !op.contains("--liberar-no-idempotente"));
    String sagaId = saga.getProperty("sagaId");

    while (true) {
      String paso = saga.getProperty("paso");
      String siguiente;
      switch (paso) {
        case "INICIO" -> { flota.reservar(sagaId); siguiente = "RESERVADO"; }
        case "RESERVADO" -> siguiente = Boolean.parseBoolean(saga.getProperty("pagoRechazado"))
            ? "COMPENSANDO" : "PREAUTORIZADO";
        case "PREAUTORIZADO" -> siguiente = "COMPLETADA";
        case "COMPENSANDO" -> {
          int intento = Integer.parseInt(saga.getProperty("intentosCompensacion")) + 1;
          saga.setProperty("intentosCompensacion", String.valueOf(intento));
          try {
            flota.liberar(sagaId, Boolean.parseBoolean(saga.getProperty("respuestaPerdida")));
            siguiente = "COMPENSADA";
          } catch (FlotaNoDisponible error) {
            long esperaMs = 100L << (intento - 1);
            System.out.println("   liberar intento " + intento + " fallo: " + error.getMessage()
                + (intento < MAX_INTENTOS_COMPENSACION ? "; reintento en " + esperaMs + " ms" : ""));
            siguiente = intento >= MAX_INTENTOS_COMPENSACION ? "REQUIERE_INTERVENCION" : "COMPENSANDO";
            if (siguiente.equals("COMPENSANDO")) dormir(esperaMs);
          }
        }
        default -> {
          System.out.println("FIN saga " + sagaId + " estado=" + paso + " intentosCompensacion="
              + saga.getProperty("intentosCompensacion") + " flota.cupoLibre=" + flota.cupo()
              + " reservas=" + flota.reservas());
          if (flota.cupo() > CAPACIDAD_FLOTA)
            System.out.println("INCONSISTENTE: cupoLibre=" + flota.cupo() + " supera la capacidad " + CAPACIDAD_FLOTA);
          if (paso.equals("REQUIERE_INTERVENCION"))
            System.out.println("ALERTA: compensacion de " + sagaId + " agoto " + MAX_INTENTOS_COMPENSACION
                + " intentos; reservas pendientes de liberar=" + flota.reservas());
          return;
        }
      }
      if (!siguiente.equals(paso)) System.out.println(paso + " -> " + siguiente);
      saga.setProperty("paso", siguiente);
      // Primero el participante, después la saga: si muere entre los dos, el paso se repite y debe ser idempotente.
      guardar("flota.properties", flotaEstado);
      guardar("saga.properties", saga);
      if (siguiente.equals(caerTras)) {
        System.out.println("CAIDA del orquestador despues de guardar " + siguiente);
        Runtime.getRuntime().halt(1);
      }
    }
  }

  static void dormir(long ms) {
    try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
  }
}
