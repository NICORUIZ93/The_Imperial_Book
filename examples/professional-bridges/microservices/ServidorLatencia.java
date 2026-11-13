import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class ServidorLatencia {
  private ServidorLatencia() { }

  public static void main(String[] args) throws IOException {
    var servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 8082), 16);
    servidor.createContext("/health", intercambio -> responder(intercambio, "UP"));
    servidor.createContext("/lento", intercambio -> {
      try {
        Thread.sleep(1500);
        responder(intercambio, "TARIFA=12000");
        System.out.println("SERVIDOR_TERMINO_LENTO");
      } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
        intercambio.close();
      }
    });
    servidor.start();
    System.out.println("LISTEN http://127.0.0.1:8082");
  }

  private static void responder(HttpExchange intercambio, String texto) throws IOException {
    byte[] cuerpo = texto.getBytes(StandardCharsets.UTF_8);
    intercambio.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
    intercambio.sendResponseHeaders(200, cuerpo.length);
    try (var salida = intercambio.getResponseBody()) {
      salida.write(cuerpo);
    }
  }
}
