import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Utilidades HTTP compartidas por los procesos del laboratorio M2 (solo JDK). */
final class HttpUtil {
  private static final Pattern TOTAL = Pattern.compile("\"totalCop\":(-?\\d+)");

  private HttpUtil() { }

  static void responder(HttpExchange exchange, int status, String contentType, String cuerpo,
                        String servidoPor) throws IOException {
    byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().set("Content-Type", contentType);
    if (servidoPor != null) exchange.getResponseHeaders().set("X-Servido-Por", servidoPor);
    exchange.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
    try (var salida = exchange.getResponseBody()) { salida.write(bytes); }
  }

  static String leerCuerpo(HttpExchange exchange) throws IOException {
    try (var entrada = exchange.getRequestBody()) {
      return new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  /** Decodifica un cuerpo application/x-www-form-urlencoded como zona=Z03&pesoKg=2.5. */
  static Map<String, String> formulario(String cuerpo) {
    Map<String, String> campos = new HashMap<>();
    for (String par : cuerpo.split("&")) {
      int igual = par.indexOf('=');
      if (igual > 0) {
        campos.put(URLDecoder.decode(par.substring(0, igual), StandardCharsets.UTF_8),
            URLDecoder.decode(par.substring(igual + 1), StandardCharsets.UTF_8));
      }
    }
    return campos;
  }

  /** Extrae totalCop de una respuesta JSON plana; null si no aparece. */
  static Long totalCop(String json) {
    Matcher m = TOTAL.matcher(json);
    return m.find() ? Long.parseLong(m.group(1)) : null;
  }
}
