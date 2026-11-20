import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * M4 T6 · Evolución del esquema de EnvioCreado: lector tolerante, versión explícita y upcaster.
 * Uso: java EvolucionEsquema.java                 (lector tolerante con upcaster v2 -> modelo actual)
 *      java EvolucionEsquema.java --estricto      (fallo: rechaza campos desconocidos)
 *      java EvolucionEsquema.java --sin-upcaster  (fallo: lee la v2 como si fuera v1)
 */
public final class EvolucionEsquema {
  /** Modelo interno del consumidor Facturación. zona es opcional porque los eventos v1 antiguos no la traen. */
  record EnvioCreado(String envioId, BigDecimal pesoKg, String zona) { }

  private static final Pattern CAMPO = Pattern.compile("\"(\\w+)\":(\"([^\"]*)\"|[^,}]+)");
  private static final Set<String> CAMPOS_V1 = Set.of("tipo", "version", "eventoId", "envioId", "pesoKg");

  static Map<String, String> leer(String json) {
    Map<String, String> campos = new LinkedHashMap<>();
    Matcher m = CAMPO.matcher(json);
    while (m.find()) campos.put(m.group(1), m.group(3) != null ? m.group(3) : m.group(2).trim());
    return campos;
  }

  /** Lleva cualquier versión conocida a la forma actual (v1 con zona opcional). No modifica el evento original. */
  static Map<String, String> upcast(Map<String, String> evento) {
    if (!evento.get("version").equals("2")) return evento;
    Map<String, String> actual = new LinkedHashMap<>(evento);
    BigDecimal gramos = new BigDecimal(actual.remove("pesoGr"));
    actual.put("pesoKg", gramos.movePointLeft(3).stripTrailingZeros().toPlainString());
    actual.put("version", "1");
    return actual;
  }

  static EnvioCreado interpretar(String json, boolean estricto, boolean conUpcaster) {
    Map<String, String> evento = leer(json);
    if (estricto) {
      for (String campo : evento.keySet()) {
        if (!CAMPOS_V1.contains(campo)) throw new IllegalArgumentException("campo desconocido '" + campo + "'");
      }
    }
    if (conUpcaster) evento = upcast(evento);
    String peso = evento.get("pesoKg");
    if (peso == null) throw new IllegalArgumentException("falta pesoKg en version " + evento.get("version"));
    return new EnvioCreado(evento.get("envioId"), new BigDecimal(peso), evento.get("zona"));
  }

  public static void main(String[] args) {
    boolean estricto = List.of(args).contains("--estricto");
    boolean conUpcaster = !List.of(args).contains("--sin-upcaster");
    List<String> recibidos = List.of(
        "{\"tipo\":\"EnvioCreado\",\"version\":1,\"eventoId\":\"a1\",\"envioId\":\"E-1\",\"pesoKg\":2.5}",
        "{\"tipo\":\"EnvioCreado\",\"version\":1,\"eventoId\":\"a2\",\"envioId\":\"E-2\",\"pesoKg\":1,\"zona\":\"Z03\"}",
        "{\"tipo\":\"EnvioCreado\",\"version\":2,\"eventoId\":\"a3\",\"envioId\":\"E-3\",\"pesoGr\":5000,\"zona\":\"Z01\"}");
    for (String json : recibidos) {
      try {
        System.out.println("OK      " + interpretar(json, estricto, conUpcaster));
      } catch (IllegalArgumentException error) {
        System.out.println("RECHAZO " + leer(json).get("eventoId") + ": " + error.getMessage());
      }
    }
  }
}
