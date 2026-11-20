import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;

public final class ClienteTimeout {
  private ClienteTimeout() { }

  public static void main(String[] args) throws Exception {
    try (var cliente = HttpClient.newBuilder()
        .connectTimeout(Duration.ofMillis(300))
        .build()) {
      var solicitud = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8082/lento"))
          .timeout(Duration.ofMillis(500))
          .GET()
          .build();
      try {
        var respuesta = cliente.send(solicitud, HttpResponse.BodyHandlers.ofString());
        System.out.printf("HTTP_%d %s%n", respuesta.statusCode(), respuesta.body());
      } catch (HttpTimeoutException error) {
        System.out.println("TIMEOUT_SOLICITUD HttpTimeoutException");
      }
    }
  }
}
