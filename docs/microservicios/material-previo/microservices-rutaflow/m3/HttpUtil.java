import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/** Utilidades HTTP compartidas por los procesos del laboratorio M3 (solo JDK). */
final class HttpUtil {
  private HttpUtil() { }

  static void json(HttpExchange exchange, int status, String cuerpo) throws IOException {
    byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().set("Content-Type", "application/json");
    exchange.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
    try (var salida = exchange.getResponseBody()) { salida.write(bytes); }
  }

  static Map<String, String> query(HttpExchange exchange) {
    Map<String, String> campos = new HashMap<>();
    String crudo = exchange.getRequestURI().getRawQuery();
    if (crudo == null) return campos;
    for (String par : crudo.split("&")) {
      int igual = par.indexOf('=');
      if (igual > 0) campos.put(URLDecoder.decode(par.substring(0, igual), StandardCharsets.UTF_8),
          URLDecoder.decode(par.substring(igual + 1), StandardCharsets.UTF_8));
    }
    return campos;
  }
}
