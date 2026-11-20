import java.util.ArrayList;
import java.util.List;

/**
 * M4 T2 · Por qué no basta con «guardar y después publicar».
 * Simula una base de datos transaccional y un broker en memoria, y un proceso que muere en el peor momento.
 * Uso: java EscrituraDoble.java guardar-y-publicar   (muere entre el COMMIT y el envío al broker)
 *      java EscrituraDoble.java publicar-y-guardar   (publica y luego falla el COMMIT)
 *      java EscrituraDoble.java outbox               (guarda envío y mensaje juntos; un relay publica después)
 */
public final class EscrituraDoble {
  static final List<String> tablaEnvios = new ArrayList<>();
  static final List<String> tablaOutbox = new ArrayList<>();
  static final List<String> broker = new ArrayList<>();

  static final class CaidaDelProceso extends RuntimeException {
    CaidaDelProceso(String donde) { super("el proceso murio " + donde); }
  }

  /** Transacción mínima: aplica todos los cambios o ninguno. */
  static void transaccion(Runnable cambios, boolean fallaAlConfirmar) {
    List<String> enviosAntes = List.copyOf(tablaEnvios);
    List<String> outboxAntes = List.copyOf(tablaOutbox);
    cambios.run();
    if (fallaAlConfirmar) {
      tablaEnvios.clear(); tablaEnvios.addAll(enviosAntes);
      tablaOutbox.clear(); tablaOutbox.addAll(outboxAntes);
      throw new IllegalStateException("COMMIT fallido: violacion de restriccion");
    }
  }

  static void relay() {
    for (String mensaje : List.copyOf(tablaOutbox)) {
      broker.add(mensaje);
      tablaOutbox.remove(mensaje);
    }
  }

  public static void main(String[] args) {
    String modo = args.length > 0 ? args[0] : "outbox";
    try {
      switch (modo) {
        case "guardar-y-publicar" -> {
          transaccion(() -> tablaEnvios.add("E-1"), false);
          throw new CaidaDelProceso("despues del COMMIT y antes de publicar");
        }
        case "publicar-y-guardar" -> {
          broker.add("EnvioCreado E-1");
          transaccion(() -> tablaEnvios.add("E-1"), true);
        }
        case "outbox" -> {
          transaccion(() -> { tablaEnvios.add("E-1"); tablaOutbox.add("EnvioCreado E-1"); }, false);
          throw new CaidaDelProceso("despues del COMMIT y antes del relay");
        }
        default -> throw new IllegalArgumentException("modo desconocido: " + modo);
      }
    } catch (CaidaDelProceso | IllegalStateException fallo) {
      System.out.println("FALLO " + fallo.getMessage());
    }
    if (modo.equals("outbox")) {
      System.out.println("REINICIO: el relay lee la tabla outbox");
      relay();
    }
    System.out.println("envios=" + tablaEnvios + " broker=" + broker);
    boolean coherente = tablaEnvios.isEmpty() == broker.isEmpty();
    System.out.println(coherente ? "COHERENTE" : "INCOHERENTE");
  }
}
