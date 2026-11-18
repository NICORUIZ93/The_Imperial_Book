import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Revisa que cada falacia tenga una evidencia real guardada en los temas anteriores del módulo. */
public final class FalaciasDistribuidas {
  record Evidencia(String archivo, String marca) { }
  record Falacia(String nombre, String mitigacion, List<Evidencia> evidencias) { }

  private static final List<Falacia> FALACIAS = List.of(
      new Falacia("red_confiable", "reconciliacion+idempotencia", List.of(
          new Evidencia("resultado-desconocido/evidence/resultado.txt", "CONFIRMADO"),
          new Evidencia("idempotencia/evidence/idempotencia.txt", "efectos=1"))),
      new Falacia("latencia_cero", "deadline+medicion", List.of(
          new Evidencia("m0-t2/evidence/tema-2.txt", "HttpTimeoutException"))),
      new Falacia("ancho_infinito", "limite+framing", List.of(
          new Evidencia("framing/evidence/framing.txt", "PAYLOAD_EXCESIVO"))),
      new Falacia("topologia_estable", "descubrimiento+health", List.of(
          new Evidencia("m0-t1/evidence/tema-1.txt", "UP"))),
      new Falacia("sistema_homogeneo", "contrato+compatibilidad", List.of(
          new Evidencia("contratos/evidence/envio-v1.json", "\"estado\""),
          new Evidencia("contratos/evidence/envio-v2.json", "\"ciudadDestino\""))));

  private FalaciasDistribuidas() { }

  public static void main(String[] args) throws IOException {
    Path labs = Path.of(args.length > 0 ? args[0] : "..");
    int faltantes = 0;
    for (Falacia falacia : FALACIAS) {
      String problema = buscarProblema(labs, falacia.evidencias());
      if (problema == null) {
        System.out.println("REFUTADA " + falacia.nombre() + " -> " + falacia.mitigacion());
      } else {
        System.out.println("SIN_EVIDENCIA " + falacia.nombre() + ": " + problema);
        faltantes++;
      }
    }
    System.out.println("SIN_DEMOSTRAR red_segura: el laboratorio en loopback no prueba identidad ni cifrado");
    if (faltantes > 0) {
      System.err.println("REVISION_RECHAZADA faltan " + faltantes + " evidencias");
      System.exit(1);
    }
  }

  private static String buscarProblema(Path labs, List<Evidencia> evidencias) throws IOException {
    for (Evidencia evidencia : evidencias) {
      Path archivo = labs.resolve(evidencia.archivo());
      if (!Files.isRegularFile(archivo)) return "falta " + evidencia.archivo();
      if (!Files.readString(archivo, StandardCharsets.UTF_8).contains(evidencia.marca()))
        return evidencia.archivo() + " no contiene " + evidencia.marca();
    }
    return null;
  }
}
