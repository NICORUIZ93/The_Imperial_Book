import java.util.Comparator;
import java.util.List;

/**
 * M2 T2 · Elegir la primera costura con las señales de M1 T12.
 * Uso: java ElegirCostura.java              (criterio por señales)
 *      java ElegirCostura.java --por-tamano (fallo deliberado: elegir por líneas de código)
 */
public final class ElegirCostura {

  /**
   * Señales medidas en el monolito modular (M1 T12).
   * llamadasEntrantes: módulos que lo invocan; tablasEscritasPorOtros: tablas suyas que otro módulo escribe.
   */
  record Candidato(String nombre, int lineasDeCodigo, int cambiosPorMes, int llamadasEntrantes,
                   int tablasEscritasPorOtros, boolean rutaHttpPropia, boolean soloLectura) { }

  record Evaluacion(Candidato candidato, int puntos, String bloqueo) { }

  static Evaluacion evaluar(Candidato c) {
    if (!c.rutaHttpPropia()) return new Evaluacion(c, 0, "sin ruta propia: el proxy no puede interceptarla");
    if (c.tablasEscritasPorOtros() > 0)
      return new Evaluacion(c, 0, c.tablasEscritasPorOtros() + " tabla(s) escrita(s) por otros modulos");
    int puntos = Math.min(c.cambiosPorMes(), 10) * 2   // cadencia propia: beneficio de desplegar aparte
        - c.llamadasEntrantes() * 3                     // cada consumidor interno es una llamada remota nueva
        + (c.soloLectura() ? 5 : 0);                    // un cálculo sin escrituras admite ejecución en paralelo
    return new Evaluacion(c, puntos, "");
  }

  public static void main(String[] args) {
    boolean porTamano = List.of(args).contains("--por-tamano");
    List<Candidato> candidatos = List.of(
        new Candidato("Cotizacion", 1800, 9, 1, 0, true, true),
        new Candidato("Facturacion", 5200, 3, 2, 1, true, false),
        new Candidato("Tracking", 2400, 4, 3, 0, true, true),
        new Candidato("Asignacion", 6100, 6, 2, 2, false, false));

    if (porTamano) {
      var mayor = candidatos.stream().max(Comparator.comparingInt(Candidato::lineasDeCodigo)).orElseThrow();
      System.out.println("ELEGIDA_POR_TAMANO " + mayor.nombre() + " (" + mayor.lineasDeCodigo() + " lineas)");
      System.out.println("BLOQUEO_IGNORADO " + evaluar(mayor).bloqueo());
      return;
    }
    candidatos.stream().map(ElegirCostura::evaluar)
        .sorted(Comparator.comparingInt(Evaluacion::puntos).reversed())
        .forEach(e -> System.out.println(String.format("%-12s puntos=%3d %s", e.candidato().nombre(),
            e.puntos(), e.bloqueo().isEmpty() ? "" : "BLOQUEADA: " + e.bloqueo())));
  }
}
