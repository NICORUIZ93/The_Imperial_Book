import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * M2 · Cliente que cotiza varios pesos a través del proxy (127.0.0.1:8080).
 * Uso: java -cp out ClienteCotizaciones Z03 1 2 3 4 5
 */
public final class ClienteCotizaciones {
  private ClienteCotizaciones() { }

  public static void main(String[] args) throws Exception {
    if (args.length < 2) throw new IllegalArgumentException("uso: ClienteCotizaciones <zona> <pesoKg>...");
    var http = HttpClient.newHttpClient();
    for (int i = 1; i < args.length; i++) {
      var pedido = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8080/cotizaciones"))
          .timeout(Duration.ofSeconds(3))
          .header("Content-Type", "application/x-www-form-urlencoded")
          .POST(HttpRequest.BodyPublishers.ofString("zona=" + args[0] + "&pesoKg=" + args[i])).build();
      var respuesta = http.send(pedido, HttpResponse.BodyHandlers.ofString());
      System.out.println("pesoKg=" + args[i] + " status=" + respuesta.statusCode() + " servidoPor="
          + respuesta.headers().firstValue("X-Servido-Por").orElse("?") + " " + respuesta.body());
    }
  }
}
