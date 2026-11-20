import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class DependenciaDeadline {
  private DependenciaDeadline() { }

  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8083), 16);
    server.createContext("/tarifa", DependenciaDeadline::tarifa);
    server.start();
    System.out.println("DEPENDENCIA http://127.0.0.1:8083/tarifa");
  }

  private static void tarifa(HttpExchange exchange) throws IOException {
    String raw = exchange.getRequestHeaders().getFirst("X-Deadline-Epoch-Millis");
    if (raw == null) {
      respond(exchange, 400, "DEADLINE_REQUERIDO");
      return;
    }
    long remaining;
    try {
      remaining = Long.parseLong(raw) - System.currentTimeMillis();
    } catch (NumberFormatException error) {
      respond(exchange, 400, "DEADLINE_INVALIDO");
      return;
    }
    if (remaining < 450) {
      respond(exchange, 504, "SIN_PRESUPUESTO_DEPENDENCIA");
      return;
    }
    try {
      Thread.sleep(400);
      respond(exchange, 200, "TARIFA=12000");
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      exchange.close();
    }
  }

  private static void respond(HttpExchange exchange, int status, String text) throws IOException {
    byte[] body = text.getBytes(StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status, body.length);
    try (var output = exchange.getResponseBody()) {
      output.write(body);
    }
  }
}
