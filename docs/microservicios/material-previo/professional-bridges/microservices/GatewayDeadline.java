import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public final class GatewayDeadline {
  private static final long RESERVE_MILLIS = 100;
  private static final HttpClient CLIENT = HttpClient.newHttpClient();

  private GatewayDeadline() { }

  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8082), 16);
    server.createContext("/cotizar", GatewayDeadline::quote);
    server.start();
    System.out.println("GATEWAY http://127.0.0.1:8082/cotizar");
  }

  private static void quote(HttpExchange exchange) throws IOException {
    String raw = exchange.getRequestHeaders().getFirst("X-Deadline-Epoch-Millis");
    long deadline;
    try {
      deadline = Long.parseLong(raw == null ? "" : raw);
    } catch (NumberFormatException error) {
      respond(exchange, 400, "DEADLINE_INVALIDO");
      return;
    }
    long remaining = deadline - System.currentTimeMillis();
    if (remaining <= RESERVE_MILLIS) {
      respond(exchange, 504, "SIN_PRESUPUESTO_GATEWAY");
      return;
    }
    var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8083/tarifa"))
        .header("X-Deadline-Epoch-Millis", Long.toString(deadline))
        .timeout(Duration.ofMillis(remaining - RESERVE_MILLIS))
        .GET()
        .build();
    try {
      var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
      respond(exchange, response.statusCode(), response.body());
    } catch (Exception error) {
      respond(exchange, 504, "DEPENDENCIA_NO_COMPLETO");
    }
  }

  private static void respond(HttpExchange exchange, int status, String text) throws IOException {
    byte[] body = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status, body.length);
    try (var output = exchange.getResponseBody()) {
      output.write(body);
    }
  }
}
