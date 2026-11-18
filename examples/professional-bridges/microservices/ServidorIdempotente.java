import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public final class ServidorIdempotente {
  record Record(String fingerprint, int status, String body) { }
  private static final ConcurrentHashMap<String, Record> RECORDS = new ConcurrentHashMap<>();
  private static final AtomicInteger EFFECTS = new AtomicInteger();

  private ServidorIdempotente() { }

  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8085), 16);
    server.createContext("/envios", ServidorIdempotente::create);
    server.createContext("/metricas", exchange -> respond(exchange, 200, "efectos=" + EFFECTS.get()));
    server.start();
    System.out.println("LISTEN http://127.0.0.1:8085");
  }

  private static void create(HttpExchange exchange) throws IOException {
    if (!exchange.getRequestMethod().equals("POST")) { respond(exchange, 405, "METODO_NO_PERMITIDO"); return; }
    String key = exchange.getRequestHeaders().getFirst("Idempotency-Key");
    String fingerprint = exchange.getRequestHeaders().getFirst("X-Payload-Fingerprint");
    if (key == null || fingerprint == null) { respond(exchange, 400, "CLAVE_Y_HUELLA_REQUERIDAS"); return; }
    var created = new boolean[1];
    Record record = RECORDS.compute(key, (ignored, existing) -> {
      if (existing != null) return existing;
      created[0] = true;
      int number = EFFECTS.incrementAndGet();
      return new Record(fingerprint, 201, "ENVIO_CREADO numero=" + number);
    });
    if (!record.fingerprint().equals(fingerprint)) { respond(exchange, 409, "CLAVE_REUTILIZADA_CON_OTRO_PAYLOAD"); return; }
    exchange.getResponseHeaders().set("Idempotency-Replayed", Boolean.toString(!created[0]));
    respond(exchange, record.status(), record.body());
  }

  private static void respond(HttpExchange exchange, int status, String text) throws IOException {
    byte[] body = text.getBytes(StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status, body.length);
    try (var output = exchange.getResponseBody()) { output.write(body); }
  }
}
