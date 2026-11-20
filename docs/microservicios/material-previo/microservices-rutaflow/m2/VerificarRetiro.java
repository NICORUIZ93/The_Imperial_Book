import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * M2 T6 · ¿Se puede retirar el código heredado de Cotización?
 * Uso: java VerificarRetiro.java evidencia-retiro.properties
 */
public final class VerificarRetiro {
  private VerificarRetiro() { }

  static List<String> bloqueos(Properties e) {
    List<String> bloqueos = new ArrayList<>();
    if (entero(e, "solicitudesAlLegadoPorProxy30d") > 0)
      bloqueos.add("el proxy aun envia trafico de /cotizaciones al monolito");
    if (entero(e, "llamadasInternasAlCodigoHeredado30d") > 0)
      bloqueos.add("otro modulo del monolito llama al codigo heredado sin pasar por el proxy");
    if (entero(e, "discrepanciasUltimasComparaciones") > 0)
      bloqueos.add("la ejecucion en paralelo aun muestra discrepancias");
    if (entero(e, "diasSinReversion") < 14)
      bloqueos.add("ventana de reversion abierta: " + entero(e, "diasSinReversion") + " de 14 dias");
    if (!Boolean.parseBoolean(e.getProperty("adrDeRetiroAprobado", "false")))
      bloqueos.add("falta el ADR que aprueba el retiro");
    return bloqueos;
  }

  private static int entero(Properties e, String clave) {
    String valor = e.getProperty(clave);
    if (valor == null) throw new IllegalArgumentException("falta la evidencia " + clave);
    return Integer.parseInt(valor.trim());
  }

  public static void main(String[] args) throws IOException {
    var evidencia = new Properties();
    try (Reader lector = Files.newBufferedReader(Path.of(args[0]), StandardCharsets.UTF_8)) {
      evidencia.load(lector);
    }
    List<String> bloqueos = bloqueos(evidencia);
    bloqueos.forEach(b -> System.out.println("BLOQUEO " + b));
    System.out.println(bloqueos.isEmpty() ? "PUEDE_RETIRAR" : "NO_RETIRAR (" + bloqueos.size() + ")");
  }
}
