import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

/**
 * M3 T1 · Gateway en :8090. Enruta y descarga responsabilidades transversales; no contiene reglas de negocio.
 * - Enrutamiento: /api/envios -> :8091/envios, /api/cotizaciones -> :8092/cotizaciones
 * - Autenticación por X-Api-Key (401 si falta o no existe); la clave no se reenvía.
 * - Límite de tasa por cliente: cubeta de 5 fichas que recupera 1 ficha por segundo (429 + Retry-After).
 * - X-Request-Id: se conserva el del cliente o se genera uno.
 * Uso: java -cp out Gateway                 (una cubeta por cliente)
 *      java -cp out Gateway --bucket-global (fallo deliberado: todos los clientes comparten cubeta)
 */
public final class Gateway {
  private static final Map<String, String> CLIENTES = Map.of(
      "k-app-conductor", "app-conductor", "k-consola", "consola-web");
  private static final Map<String, String> RUTAS = Map.of(
      "/api/envios", "http://127.0.0.1:8091/envios", "/api/cotizaciones", "http://127.0.0.1:8092/cotizaciones");
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build();
  private static final Map<String, Cubeta> CUBETAS = new ConcurrentHashMap<>();
  private static boolean cubetaGlobal;

  /** Cubeta de fichas: capacidad fija y recarga continua proporcional al tiempo transcurrido. */
  static final class Cubeta {
    private final double capacidad;
    private final double fichasPorSegundo;
    private double fichas;
    private long ultimaRecargaNanos;

    Cubeta(double capacidad, double fichasPorSegundo, long ahoraNanos) {
      this.capacidad = capacidad;
      this.fichasPorSegundo = fichasPorSegundo;
      this.fichas = capacidad;
      this.ultimaRecargaNanos = ahoraNanos;
    }

    synchronized boolean tomar(long ahoraNanos) {
      fichas = Math.min(capacidad, fichas + (ahoraNanos - ultimaRecargaNanos) / 1e9 * fichasPorSegundo);
      ultimaRecargaNanos = ahoraNanos;
      if (fichas < 1) return false;
      fichas -= 1;
      return true;
    }
  }

  private Gateway() { }

  public static void main(String[] args) throws IOException {
    cubetaGlobal = List.of(args).contains("--bucket-global");
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8090), 64);
    server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    server.createContext("/", Gateway::atender);
    server.start();
    System.out.println("GATEWAY http://127.0.0.1:8090 cubetaGlobal=" + cubetaGlobal);
  }

  private static void atender(HttpExchange ex) throws IOException {
    String cliente = CLIENTES.get(String.valueOf(ex.getRequestHeaders().getFirst("X-Api-Key")));
    if (cliente == null) { HttpUtil.json(ex, 401, "{\"error\":\"API_KEY_INVALIDA\"}"); return; }

    var cubeta = CUBETAS.computeIfAbsent(cubetaGlobal ? "global" : cliente,
        k -> new Cubeta(5, 1, System.nanoTime()));
    if (!cubeta.tomar(System.nanoTime())) {
      ex.getResponseHeaders().set("Retry-After", "1");
      HttpUtil.json(ex, 429, "{\"error\":\"LIMITE_DE_TASA\",\"cliente\":\"" + cliente + "\"}");
      return;
    }

    String ruta = ex.getRequestURI().getPath();
    String base = RUTAS.entrySet().stream()
        .filter(r -> ruta.equals(r.getKey()) || ruta.startsWith(r.getKey() + "/"))
        .map(r -> r.getValue() + ruta.substring(r.getKey().length())).findFirst().orElse(null);
    if (base == null) { HttpUtil.json(ex, 404, "{\"error\":\"RUTA_DESCONOCIDA\"}"); return; }

    String requestId = ex.getRequestHeaders().getFirst("X-Request-Id");
    if (requestId == null) requestId = UUID.randomUUID().toString();
    String query = ex.getRequestURI().getRawQuery();
    var pedido = HttpRequest.newBuilder(URI.create(base + (query == null ? "" : "?" + query)))
        .timeout(Duration.ofSeconds(2))
        .header("X-Request-Id", requestId)
        .header("X-Cliente", cliente) // identidad ya verificada; X-Api-Key no viaja hacia dentro
        .GET().build();
    try {
      var respuesta = HTTP.send(pedido, HttpResponse.BodyHandlers.ofString());
      ex.getResponseHeaders().set("X-Request-Id", requestId);
      HttpUtil.json(ex, respuesta.statusCode(), respuesta.body());
      System.out.println("GATEWAY " + cliente + " " + ruta + " -> " + respuesta.statusCode() + " id=" + requestId);
    } catch (IOException error) {
      HttpUtil.json(ex, 502, "{\"error\":\"DESTINO_NO_DISPONIBLE\"}");
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      HttpUtil.json(ex, 503, "{\"error\":\"INTERRUMPIDO\"}");
    }
  }
}
