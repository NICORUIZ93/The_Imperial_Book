import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * M2 · Servicio Cotización extraído, en 127.0.0.1:8082.
 * Obtiene la tarifa del monolito a través de CapaAnticorrupcion y calcula con su propio modelo.
 * Uso: java -cp out CotizacionService                     (redondeo HALF_UP, igual al monolito)
 *      java -cp out CotizacionService --redondeo=HALF_EVEN (fallo deliberado del tema 5)
 */
public final class CotizacionService {
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build();
  private static final AtomicInteger SECUENCIA = new AtomicInteger();
  private static RoundingMode redondeo = RoundingMode.HALF_UP;

  private CotizacionService() { }

  public static void main(String[] args) throws IOException {
    for (String arg : List.of(args)) {
      if (arg.startsWith("--redondeo=")) redondeo = RoundingMode.valueOf(arg.substring(11));
    }
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8082), 32);
    server.createContext("/cotizaciones", CotizacionService::cotizar);
    server.start();
    System.out.println("COTIZACION http://127.0.0.1:8082 redondeo=" + redondeo);
  }

  static long calcular(CapaAnticorrupcion.Tarifa tarifa, BigDecimal pesoKg) {
    return tarifa.precioPorKgCop().multiply(pesoKg).add(BigDecimal.valueOf(tarifa.baseCop()))
        .setScale(0, redondeo).longValueExact();
  }

  private static void cotizar(HttpExchange ex) throws IOException {
    if (!ex.getRequestURI().getPath().equals("/cotizaciones") || !ex.getRequestMethod().equals("POST")) {
      HttpUtil.responder(ex, 404, "text/plain", "", "cotizacion");
      return;
    }
    boolean sombra = "true".equals(ex.getRequestHeaders().getFirst("X-Modo-Sombra"));
    var campos = HttpUtil.formulario(HttpUtil.leerCuerpo(ex));
    String codigoZona = campos.getOrDefault("zona", "");
    try {
      CapaAnticorrupcion.zona(codigoZona); // valida antes de llamar al monolito
      var pedido = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8081/legacy/tarifas/" + codigoZona))
          .timeout(Duration.ofMillis(500)).GET().build();
      var registro = HTTP.send(pedido, HttpResponse.BodyHandlers.ofString());
      if (registro.statusCode() != 200)
        throw new CapaAnticorrupcion.RegistroHeredadoInvalido("monolito respondio " + registro.statusCode());
      long total = calcular(CapaAnticorrupcion.traducir(registro.body()), new BigDecimal(campos.get("pesoKg")));
      String id = (sombra ? "S-" : "C-") + SECUENCIA.incrementAndGet();
      HttpUtil.responder(ex, 200, "application/json",
          "{\"cotizacionId\":\"" + id + "\",\"totalCop\":" + total + "}", "cotizacion");
    } catch (CapaAnticorrupcion.RegistroHeredadoInvalido error) {
      HttpUtil.responder(ex, 422, "application/json", "{\"error\":\"" + error.getMessage() + "\"}", "cotizacion");
    } catch (IOException error) {
      HttpUtil.responder(ex, 503, "application/json", "{\"error\":\"MONOLITO_NO_DISPONIBLE\"}", "cotizacion");
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      HttpUtil.responder(ex, 503, "application/json", "{\"error\":\"INTERRUMPIDO\"}", "cotizacion");
    }
  }
}
