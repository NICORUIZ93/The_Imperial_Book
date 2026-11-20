import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * JSON mínimo para el laboratorio M3: objetos planos con valores texto, número, booleano o null.
 * No es un parser general; el laboratorio lo usa para no depender de librerías externas.
 */
final class JsonPlano {
  private static final Pattern OBJETO = Pattern.compile("\\{[^{}]*\\}");
  private static final Pattern CAMPO = Pattern.compile("\"(\\w+)\":(\"((?:[^\"\\\\]|\\\\.)*)\"|[^,}]+)");

  private JsonPlano() { }

  static Map<String, String> objeto(String json) {
    Map<String, String> campos = new LinkedHashMap<>();
    Matcher m = CAMPO.matcher(json);
    while (m.find()) campos.put(m.group(1), m.group(3) != null ? m.group(3) : m.group(2).trim());
    return campos;
  }

  static List<Map<String, String>> lista(String json) {
    List<Map<String, String>> objetos = new ArrayList<>();
    Matcher m = OBJETO.matcher(json);
    while (m.find()) objetos.add(objeto(m.group()));
    return objetos;
  }

  /** Serializa: los valores que empiezan por '#' se escriben sin comillas (números, null, objetos). */
  static String escribir(Map<String, String> campos) {
    StringBuilder sb = new StringBuilder("{");
    campos.forEach((k, v) -> {
      if (sb.length() > 1) sb.append(',');
      sb.append('"').append(k).append("\":");
      if (v.startsWith("#")) sb.append(v.substring(1));
      else sb.append('"').append(v.replace("\\", "\\\\").replace("\"", "\\\"")).append('"');
    });
    return sb.append('}').toString();
  }

  static String escribirLista(List<Map<String, String>> objetos) {
    StringBuilder sb = new StringBuilder("[");
    for (Map<String, String> o : objetos) {
      if (sb.length() > 1) sb.append(',');
      sb.append(escribir(o));
    }
    return sb.append(']').toString();
  }
}
