import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.Reader;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;

/**
 * M2 · Fachada Strangler Fig en 127.0.0.1:8080.
 * Lee rutas.properties («/prefijo=destino», destino: monolito | cotizacion | sombra) y, si cambia el
 * archivo, recarga la tabla sin reiniciar. Lo que no coincide con ningún prefijo va al monolito.
 *
 * Uso: java -cp out ProxyStrangler                    (coincidencia por segmentos y recarga en caliente)
 *      java -cp out ProxyStrangler --prefijo-ingenuo  (fallo deliberado del tema 3)
 *      java -cp out ProxyStrangler --sin-recarga      (fallo deliberado del tema 6)
 */
public final class ProxyStrangler {
  private static final Map<String, String> DESTINOS = Map.of(
      "monolito", "http://127.0.0.1:8081", "cotizacion", "http://127.0.0.1:8082");
  private static final Path RUTAS = Path.of("rutas.properties");
  private static final Path COMPARACIONES = Path.of("evidencia", "comparaciones.log");
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build();

  private static boolean prefijoIngenuo;
  private static boolean sinRecarga;
  private static volatile TreeMap<String, String> tabla = new TreeMap<>();
  private static volatile long versionLeida = -1;

  private ProxyStrangler() { }

  public static void main(String[] args) throws IOException {
    prefijoIngenuo = List.of(args).contains("--prefijo-ingenuo");
    sinRecarga = List.of(args).contains("--sin-recarga");
    Files.createDirectories(COMPARACIONES.getParent());
    recargarSiCambio();
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8080), 64);
    server.createContext("/", ProxyStrangler::enrutar);
    server.start();
    System.out.println("PROXY http://127.0.0.1:8080 prefijoIngenuo=" + prefijoIngenuo + " sinRecarga=" + sinRecarga);
  }

  private static synchronized void recargarSiCambio() throws IOException {
    long modificado = Files.getLastModifiedTime(RUTAS).toMillis();
    if (modificado == versionLeida || (sinRecarga && versionLeida != -1)) return;
    var props = new Properties();
    try (Reader lector = Files.newBufferedReader(RUTAS, StandardCharsets.UTF_8)) { props.load(lector); }
    var nueva = new TreeMap<String, String>();
    props.forEach((k, v) -> nueva.put(k.toString().trim(), v.toString().trim()));
    tabla = nueva;
    versionLeida = modificado;
    System.out.println("RUTAS_CARGADAS " + nueva);
  }

  /** Elige el prefijo más largo que coincide. Por segmentos, /cotizaciones no captura /cotizaciones-pdf. */
  static String destinoPara(String ruta) {
    String elegido = "monolito";
    int largo = -1;
    for (var regla : tabla.entrySet()) {
      String prefijo = regla.getKey();
      boolean coincide = prefijoIngenuo ? ruta.startsWith(prefijo)
          : ruta.equals(prefijo) || ruta.startsWith(prefijo + "/");
      if (coincide && prefijo.length() > largo) { elegido = regla.getValue(); largo = prefijo.length(); }
    }
    return elegido;
  }

  private static void enrutar(HttpExchange ex) throws IOException {
    recargarSiCambio();
    long inicio = System.nanoTime();
    String ruta = ex.getRequestURI().getPath();
    String destino = destinoPara(ruta);
    byte[] cuerpo = HttpUtil.leerCuerpo(ex).getBytes(StandardCharsets.UTF_8);
    String principal = destino.equals("sombra") ? "monolito" : destino;
    try {
      HttpResponse<String> respuesta = reenviar(ex, DESTINOS.get(principal), cuerpo, false);
      String servidoPor = respuesta.headers().firstValue("X-Servido-Por").orElse(principal);
      ex.getResponseHeaders().set("X-Proxy", "strangler");
      HttpUtil.responder(ex, respuesta.statusCode(),
          respuesta.headers().firstValue("Content-Type").orElse("text/plain"), respuesta.body(), servidoPor);
      System.out.printf("PROXY %s %s -> %s (%d ms)%n", ex.getRequestMethod(), ruta, destino,
          (System.nanoTime() - inicio) / 1_000_000);
      if (destino.equals("sombra")) compararEnSegundoPlano(ex, cuerpo, respuesta.body());
    } catch (IOException error) {
      HttpUtil.responder(ex, 502, "text/plain", "DESTINO_NO_DISPONIBLE " + principal, null);
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      HttpUtil.responder(ex, 503, "text/plain", "INTERRUMPIDO", null);
    }
  }

  private static HttpResponse<String> reenviar(HttpExchange ex, String base, byte[] cuerpo, boolean sombra)
      throws IOException, InterruptedException {
    var pedido = HttpRequest.newBuilder(URI.create(base + ex.getRequestURI()))
        .timeout(Duration.ofSeconds(2))
        .method(ex.getRequestMethod(), cuerpo.length == 0 ? HttpRequest.BodyPublishers.noBody()
            : HttpRequest.BodyPublishers.ofByteArray(cuerpo));
    String tipo = ex.getRequestHeaders().getFirst("Content-Type");
    if (tipo != null) pedido.header("Content-Type", tipo);
    if (sombra) pedido.header("X-Modo-Sombra", "true");
    return HTTP.send(pedido.build(), HttpResponse.BodyHandlers.ofString());
  }

  /** Ejecución en paralelo: el cliente ya recibió la respuesta del monolito; el candidato solo se compara. */
  private static void compararEnSegundoPlano(HttpExchange ex, byte[] cuerpo, String respuestaControl) {
    Thread.ofVirtual().start(() -> {
      String linea;
      try {
        var candidato = reenviar(ex, DESTINOS.get("cotizacion"), cuerpo, true);
        Long control = HttpUtil.totalCop(respuestaControl);
        Long nuevo = HttpUtil.totalCop(candidato.body());
        String veredicto = control != null && control.equals(nuevo) ? "IGUAL" : "DISTINTO";
        linea = veredicto + " " + new String(cuerpo, StandardCharsets.UTF_8) + " control=" + control
            + " candidato=" + nuevo;
      } catch (IOException | InterruptedException error) {
        linea = "ERROR_CANDIDATO " + new String(cuerpo, StandardCharsets.UTF_8) + " " + error.getClass().getSimpleName();
      }
      try {
        Files.writeString(COMPARACIONES, linea + System.lineSeparator(), StandardCharsets.UTF_8,
            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
      } catch (IOException error) {
        System.out.println("NO_SE_PUDO_REGISTRAR " + linea);
      }
    });
  }
}
