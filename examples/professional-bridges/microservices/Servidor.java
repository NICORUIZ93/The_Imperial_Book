import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Servidor {
  public static void main(String[] args) throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8081), 16);
    server.createContext("/health", exchange -> {
      byte[] body = "UP".getBytes(StandardCharsets.UTF_8);
      exchange.sendResponseHeaders(200, body.length);
      try (var out = exchange.getResponseBody()) { out.write(body); }
    });
    server.start();
    System.out.println("LISTEN 127.0.0.1:8081 pid=" + ProcessHandle.current().pid());
  }
}
