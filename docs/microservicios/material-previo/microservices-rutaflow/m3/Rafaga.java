import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;

/**
 * M3 T1 · Ráfagas de solicitudes simultáneas al gateway, una clave detrás de otra.
 * Uso: java -cp out Rafaga k-app-conductor:10 k-consola:3
 * Cada ráfaga sale completa a la vez y dura milisegundos, así que la cubeta casi no se recarga entre ellas.
 */
public final class Rafaga {
  private Rafaga() { }

  public static void main(String[] args) {
    var http = HttpClient.newHttpClient();
    for (String argumento : args) {
      String[] partes = argumento.split(":");
      var pedido = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8090/api/envios?conductor=C-7"))
          .timeout(Duration.ofSeconds(3)).header("X-Api-Key", partes[0]).GET().build();
      List<CompletableFuture<HttpResponse<Void>>> enVuelo = new ArrayList<>();
      for (int i = 0; i < Integer.parseInt(partes[1]); i++) {
        enVuelo.add(http.sendAsync(pedido, HttpResponse.BodyHandlers.discarding()));
      }
      Map<Integer, Integer> porEstado = new TreeMap<>();
      for (var respuesta : enVuelo) porEstado.merge(respuesta.join().statusCode(), 1, Integer::sum);
      System.out.println("clave=" + partes[0] + " estados=" + porEstado);
    }
  }
}
