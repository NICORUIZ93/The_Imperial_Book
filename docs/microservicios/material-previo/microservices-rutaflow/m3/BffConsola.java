import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

/**
 * M3 T2-T5 · BFF de la consola web en :8095. Compone Envíos (crítico) con Cotización (opcional)
 * dentro de un deadline absoluto (cabecera X-Deadline-Epoch-Millis de M0 T3; por defecto, ahora + 800 ms).
 * GET /consola/v1/envios  (deprecada: Deprecation, Sunset y Link)    GET /consola/v2/envios
 * Uso: java -cp out BffConsola
 *      --secuencial             (fallo T3: cotiza un envío detrás de otro)
 *      --timeout-fijo           (fallo T3: 1 s por llamada, sin mirar el deadline)
 *      --ocultar-fallo-envios   (fallo T4: si Envíos falla, responde una lista vacía con 200)
 */
public final class BffConsola {
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(200)).build();
  private static final long PRESUPUESTO_POR_DEFECTO_MS = 800;
  private static final long RESERVA_MS = 50; // margen para componer y responder
  private static boolean secuencial;
  private static boolean timeoutFijo;
  private static boolean ocultarFalloEnvios;

  private BffConsola() { }

  public static void main(String[] args) throws IOException {
    secuencial = List.of(args).contains("--secuencial");
    timeoutFijo = List.of(args).contains("--timeout-fijo");
    ocultarFalloEnvios = List.of(args).contains("--ocultar-fallo-envios");
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8095), 64);
    server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    server.createContext("/consola/v1/envios", ex -> envios(ex, 1));
    server.createContext("/consola/v2/envios", ex -> envios(ex, 2));
    server.start();
    System.out.println("BFF_CONSOLA http://127.0.0.1:8095 secuencial=" + secuencial + " timeoutFijo="
        + timeoutFijo + " ocultarFalloEnvios=" + ocultarFalloEnvios);
  }

  private static void envios(HttpExchange ex, int version) throws IOException {
    long inicio = System.currentTimeMillis();
    String cabecera = ex.getRequestHeaders().getFirst("X-Deadline-Epoch-Millis");
    long deadline = cabecera != null ? Long.parseLong(cabecera) : inicio + PRESUPUESTO_POR_DEFECTO_MS;
    if (version == 1) {
      ex.getResponseHeaders().set("Deprecation", Deprecacion.CONSOLA_V1.deprecation());
      ex.getResponseHeaders().set("Sunset", Deprecacion.CONSOLA_V1.sunset());
      ex.getResponseHeaders().set("Link", Deprecacion.CONSOLA_V1.link());
    }

    List<Map<String, String>> envios;
    try {
      var respuesta = HTTP.send(pedido("http://127.0.0.1:8091/envios", deadline), HttpResponse.BodyHandlers.ofString());
      if (respuesta.statusCode() != 200) throw new IOException("envios respondio " + respuesta.statusCode());
      envios = JsonPlano.lista(respuesta.body());
    } catch (IOException | InterruptedException | IllegalArgumentException error) {
      if (ocultarFalloEnvios) { HttpUtil.json(ex, 200, "{\"envios\":[],\"degradado\":[]}"); return; }
      HttpUtil.json(ex, 503, "{\"error\":\"ENVIOS_NO_DISPONIBLE\"}");
      return;
    }

    Map<String, String> totales = secuencial ? cotizarUnoTrasOtro(envios, deadline) : cotizarEnParalelo(envios, deadline);
    List<String> degradado = totales.containsValue("null") ? List.of("cotizacion") : List.of();
    List<Map<String, String>> filas = new ArrayList<>();
    for (Map<String, String> envio : envios) {
      Map<String, String> fila = new LinkedHashMap<>();
      fila.put("envioId", envio.get("envioId"));
      fila.put("cliente", envio.get("cliente"));
      fila.put("conductorId", envio.get("conductorId"));
      fila.put("estado", envio.get("estado"));
      String total = totales.get(envio.get("envioId"));
      if (version == 1) fila.put("totalCop", "#" + total);
      else fila.put("cotizacion", "#" + (total.equals("null") ? "null" : "{\"totalCop\":" + total + ",\"moneda\":\"COP\"}"));
      filas.add(fila);
    }
    String cuerpo = "{\"envios\":" + JsonPlano.escribirLista(filas) + ",\"degradado\":"
        + (degradado.isEmpty() ? "[]" : "[\"cotizacion\"]") + "}";
    HttpUtil.json(ex, 200, cuerpo);
    System.out.println("BFF_CONSOLA v" + version + " " + (System.currentTimeMillis() - inicio) + " ms degradado=" + degradado);
  }

  private static Map<String, String> cotizarEnParalelo(List<Map<String, String>> envios, long deadline) {
    Map<String, CompletableFuture<String>> enVuelo = new LinkedHashMap<>();
    for (Map<String, String> envio : envios) {
      String id = envio.get("envioId");
      try {
        enVuelo.put(id, HTTP.sendAsync(pedido("http://127.0.0.1:8092/cotizaciones/" + id, deadline),
                HttpResponse.BodyHandlers.ofString())
            .thenApply(BffConsola::totalONull).exceptionally(error -> "null"));
      } catch (IllegalArgumentException sinPresupuesto) {
        enVuelo.put(id, CompletableFuture.completedFuture("null"));
      }
    }
    Map<String, String> totales = new LinkedHashMap<>();
    enVuelo.forEach((id, futuro) -> totales.put(id, futuro.join()));
    return totales;
  }

  private static Map<String, String> cotizarUnoTrasOtro(List<Map<String, String>> envios, long deadline) {
    Map<String, String> totales = new LinkedHashMap<>();
    for (Map<String, String> envio : envios) {
      String id = envio.get("envioId");
      try {
        totales.put(id, totalONull(HTTP.send(pedido("http://127.0.0.1:8092/cotizaciones/" + id, deadline),
            HttpResponse.BodyHandlers.ofString())));
      } catch (IOException | IllegalArgumentException error) {
        totales.put(id, "null");
      } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
        totales.put(id, "null");
      }
    }
    return totales;
  }

  private static String totalONull(HttpResponse<String> respuesta) {
    return respuesta.statusCode() == 200 ? JsonPlano.objeto(respuesta.body()).getOrDefault("totalCop", "null") : "null";
  }

  /** Cada llamada recibe lo que queda del deadline menos la reserva; sin presupuesto, no se llama. */
  private static HttpRequest pedido(String url, long deadline) {
    long restante = deadline - System.currentTimeMillis() - RESERVA_MS;
    if (!timeoutFijo && restante <= 0) throw new IllegalArgumentException("sin presupuesto para " + url);
    return HttpRequest.newBuilder(URI.create(url))
        .timeout(Duration.ofMillis(timeoutFijo ? 1000 : restante))
        .header("X-Deadline-Epoch-Millis", Long.toString(deadline))
        .GET().build();
  }
}
