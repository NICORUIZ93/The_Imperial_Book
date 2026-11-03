import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class Servidor {
  private static final String HOST = "127.0.0.1";
  private static final int PUERTO = 8081;

  private Servidor() { }

  public static void main(String[] args) throws IOException {
    // La dirección fija evita exponer el laboratorio fuera del equipo.
    var direccion = new InetSocketAddress(HOST, PUERTO);
    var servidor = HttpServer.create(direccion, 16);

    // El handler siempre cierra el body para liberar la conexión.
    servidor.createContext("/health", Servidor::responderSalud);
    servidor.start();

    long pid = ProcessHandle.current().pid();
    System.out.printf("LISTEN http://%s:%d/health pid=%d%n", HOST, PUERTO, pid);
  }

  private static void responderSalud(HttpExchange intercambio) throws IOException {
    byte[] cuerpo = "UP".getBytes(StandardCharsets.UTF_8);
    intercambio.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
    intercambio.sendResponseHeaders(200, cuerpo.length);
    try (var salida = intercambio.getResponseBody()) {
      salida.write(cuerpo);
    }
  }
}
