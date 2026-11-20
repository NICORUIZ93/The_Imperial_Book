import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.TreeMap;

/**
 * M4 T5 · Orden por clave, reintentos acotados y cola de mensajes muertos (DLQ).
 * Simula un broker con 2 particiones, un consumidor por partición que avanza en paralelo (intercalado con
 * una semilla fija para que la salida sea reproducible) y una proyección que exige la versión siguiente.
 * Uso: java ColaParticionada.java                 (partición por envioId)
 *      java ColaParticionada.java --round-robin   (fallo: reparte sin mirar la clave)
 *      java ColaParticionada.java --veneno        (E-2 v2 trae un payload corrupto: 3 intentos y DLQ)
 *      java ColaParticionada.java --veneno --sin-dlq   (fallo: reintenta sin límite y bloquea la partición)
 *      java ColaParticionada.java --veneno --redrive   (tras corregir, reprocesa la DLQ)
 */
public final class ColaParticionada {
  record Mensaje(String envioId, int version, String payload) {
    @Override public String toString() { return envioId + " v" + version; }
  }

  static final int PARTICIONES = 2;
  static final int MAX_INTENTOS = 3;
  static final Map<String, Integer> ultimaVersion = new TreeMap<>();
  static final Map<String, List<Mensaje>> estacionados = new HashMap<>();
  static final List<Mensaje> dlq = new ArrayList<>();
  static boolean payloadCorregido = false;
  static int huecos = 0;

  static int particion(Mensaje m, int secuencia, boolean roundRobin) {
    return roundRobin ? secuencia % PARTICIONES : Math.floorMod(m.envioId().hashCode(), PARTICIONES);
  }

  /** Efecto del consumidor. Lanza si el payload no se puede interpretar. */
  static void manejar(Mensaje m) {
    if (m.payload().equals("CORRUPTO") && !payloadCorregido)
      throw new IllegalArgumentException("payload ilegible en " + m);
  }

  /** Proyección: aplica solo la versión siguiente; estaciona las adelantadas e ignora las repetidas. */
  static void proyectar(String quien, Mensaje m) {
    int ultima = ultimaVersion.getOrDefault(m.envioId(), 0);
    if (m.version() <= ultima) { System.out.println(quien + " " + m + " DUPLICADO_IGNORADO"); return; }
    if (m.version() > ultima + 1) {
      huecos++;
      estacionados.computeIfAbsent(m.envioId(), k -> new ArrayList<>()).add(m);
      System.out.println(quien + " " + m + " HUECO: falta v" + (ultima + 1) + ", se estaciona");
      return;
    }
    ultimaVersion.put(m.envioId(), m.version());
    System.out.println(quien + " " + m + " APLICADO");
    List<Mensaje> enEspera = estacionados.getOrDefault(m.envioId(), new ArrayList<>());
    enEspera.stream().filter(e -> e.version() == m.version() + 1).findFirst().ifPresent(siguiente -> {
      enEspera.remove(siguiente);
      proyectar("  estacionado", siguiente);
    });
  }

  public static void main(String[] args) {
    List<String> opciones = List.of(args);
    boolean roundRobin = opciones.contains("--round-robin");
    boolean veneno = opciones.contains("--veneno");
    boolean sinDlq = opciones.contains("--sin-dlq");

    List<Mensaje> producidos = List.of(
        new Mensaje("E-1", 1, "ok"), new Mensaje("E-2", 1, "ok"), new Mensaje("E-3", 1, "ok"),
        new Mensaje("E-1", 2, "ok"), new Mensaje("E-2", 2, veneno ? "CORRUPTO" : "ok"),
        new Mensaje("E-4", 1, "ok"), new Mensaje("E-3", 2, "ok"), new Mensaje("E-2", 3, "ok"),
        new Mensaje("E-4", 2, "ok"));
    List<ArrayDeque<Mensaje>> particiones = new ArrayList<>();
    for (int i = 0; i < PARTICIONES; i++) particiones.add(new ArrayDeque<>());
    for (int i = 0; i < producidos.size(); i++) {
      Mensaje m = producidos.get(i);
      particiones.get(particion(m, i, roundRobin)).add(m);
    }
    for (int i = 0; i < PARTICIONES; i++) System.out.println("particion " + i + ": " + particiones.get(i));

    var reloj = new Random(7);
    int[] intentos = new int[PARTICIONES];
    int pasos = 0;
    while (particiones.stream().anyMatch(p -> !p.isEmpty()) && pasos++ < 40) {
      int p;
      do { p = reloj.nextInt(PARTICIONES); } while (particiones.get(p).isEmpty());
      Mensaje m = particiones.get(p).peek();
      try {
        manejar(m);
        particiones.get(p).poll();
        intentos[p] = 0;
        proyectar("p" + p, m);
      } catch (IllegalArgumentException error) {
        intentos[p]++;
        System.out.println("p" + p + " " + m + " ERROR intento " + intentos[p] + ": " + error.getMessage());
        if (!sinDlq && intentos[p] >= MAX_INTENTOS) {
          dlq.add(particiones.get(p).poll());
          intentos[p] = 0;
          System.out.println("p" + p + " " + m + " -> DLQ");
        }
      }
    }
    for (int i = 0; i < PARTICIONES; i++) {
      if (!particiones.get(i).isEmpty())
        System.out.println("PARTICION " + i + " BLOQUEADA; esperan detras: " + particiones.get(i));
    }
    if (opciones.contains("--redrive")) {
      payloadCorregido = true;
      System.out.println("REDRIVE de " + dlq + " tras desplegar la correccion");
      for (Mensaje m : List.copyOf(dlq)) { manejar(m); dlq.remove(m); proyectar("dlq", m); }
    }
    System.out.println("versiones=" + ultimaVersion + " huecos=" + huecos + " dlq=" + dlq
        + " estacionados=" + estacionados.values().stream().flatMap(List::stream).toList());
  }
}
