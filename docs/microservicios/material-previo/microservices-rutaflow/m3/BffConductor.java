import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * M3 T2 · BFF de la app del conductor en :8094. Contrato pensado para un móvil: solo lo que el
 * conductor necesita para la ruta del día. Envíos es crítico; Cotización no forma parte de esta experiencia.
 * GET /conductor/v1/entregas-de-hoy?conductor=C-7
 * Uso: java -cp out BffConductor
 *      java -cp out BffConductor --reutilizar-consola (fallo deliberado: añade el total cotizado «por si acaso»)
 */
public final class BffConductor {
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(200)).build();
  private static boolean reutilizarConsola;

  private BffConductor() { }

  public static void main(String[] args) throws IOException {
    reutilizarConsola = List.of(args).contains("--reutilizar-consola");
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8094), 64);
    server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    server.createContext("/conductor/v1/entregas-de-hoy", BffConductor::entregasDeHoy);
    server.start();
    System.out.println("BFF_CONDUCTOR http://127.0.0.1:8094 reutilizarConsola=" + reutilizarConsola);
  }

  private static void entregasDeHoy(HttpExchange ex) throws IOException {
    String conductor = HttpUtil.query(ex).get("conductor");
    if (conductor == null) { HttpUtil.json(ex, 400, "{\"error\":\"CONDUCTOR_REQUERIDO\"}"); return; }
    var llamadas = new AtomicInteger();
    try {
      var envios = obtener("http://127.0.0.1:8091/envios?conductor=" + conductor, llamadas);
      if (envios.statusCode() != 200) { HttpUtil.json(ex, 503, "{\"error\":\"ENVIOS_NO_DISPONIBLE\"}"); return; }
      StringBuilder entregas = new StringBuilder("[");
      for (Map<String, String> envio : JsonPlano.lista(envios.body())) {
        if (!envio.get("estado").equals("PENDIENTE")) continue;
        Map<String, String> entrega = new LinkedHashMap<>();
        entrega.put("envioId", envio.get("envioId"));
        entrega.put("direccion", envio.get("direccion"));
        entrega.put("ventana", envio.get("ventana"));
        if (reutilizarConsola) {
          var cotizacion = obtener("http://127.0.0.1:8092/cotizaciones/" + envio.get("envioId"), llamadas);
          entrega.put("cliente", envio.get("cliente"));
          entrega.put("notasInternas", envio.get("notasInternas"));
          entrega.put("totalCop", "#" + JsonPlano.objeto(cotizacion.body()).getOrDefault("totalCop", "null"));
        }
        if (entregas.length() > 1) entregas.append(',');
        entregas.append(JsonPlano.escribir(entrega));
      }
      String cuerpo = "{\"conductorId\":\"" + conductor + "\",\"entregas\":" + entregas + "]}";
      HttpUtil.json(ex, 200, cuerpo);
      System.out.println("BFF_CONDUCTOR llamadas=" + llamadas.get() + " bytes="
          + cuerpo.getBytes(StandardCharsets.UTF_8).length);
    } catch (IOException error) {
      HttpUtil.json(ex, 503, "{\"error\":\"ENVIOS_NO_DISPONIBLE\"}");
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      HttpUtil.json(ex, 503, "{\"error\":\"INTERRUMPIDO\"}");
    }
  }

  private static HttpResponse<String> obtener(String url, AtomicInteger llamadas)
      throws IOException, InterruptedException {
    llamadas.incrementAndGet();
    return HTTP.send(HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(1)).GET().build(),
        HttpResponse.BodyHandlers.ofString());
  }
}
