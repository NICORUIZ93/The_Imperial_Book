import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

public final class ServidorResultadoDesconocido {
  private static final ConcurrentHashMap<String, String> ENVIOS = new ConcurrentHashMap<>();
  private ServidorResultadoDesconocido() { }
  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8084), 16);
    server.createContext("/envios", ServidorResultadoDesconocido::handle);
    server.start();
    System.out.println("LISTEN http://127.0.0.1:8084/envios/ENV-001");
  }
  private static void handle(HttpExchange exchange) throws IOException {
    String[] parts = exchange.getRequestURI().getPath().split("/");
    if (parts.length != 3 || parts[2].isBlank()) { respond(exchange, 400, "ID_REQUERIDO"); return; }
    String id = parts[2];
    if (exchange.getRequestMethod().equals("POST")) {
      ENVIOS.put(id, "CONFIRMADO");
      System.out.println("EFECTO_CONFIRMADO " + id);
      try { Thread.sleep(900); }
      catch (InterruptedException error) { Thread.currentThread().interrupt(); exchange.close(); return; }
      respond(exchange, 201, id + " CONFIRMADO");
    } else if (exchange.getRequestMethod().equals("GET")) {
      String state = ENVIOS.get(id);
      respond(exchange, state == null ? 404 : 200, state == null ? "NO_ENCONTRADO" : id + " " + state);
    } else { respond(exchange, 405, "METODO_NO_PERMITIDO"); }
  }
  private static void respond(HttpExchange exchange, int status, String text) throws IOException {
    byte[] body = text.getBytes(StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status, body.length);
    try (var output = exchange.getResponseBody()) { output.write(body); }
  }
}
