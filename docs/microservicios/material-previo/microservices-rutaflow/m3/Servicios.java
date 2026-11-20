import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * M3 · Servicios internos simulados: Envíos en :8091 y Cotización en :8092.
 * Latencias fijas: Envíos 150 ms; Cotización 250 ms (modo ok) o 3000 ms (modo lenta).
 * El modo se cambia en caliente: curl -X POST 'http://127.0.0.1:8092/admin/modo?valor=caida'
 * Modos de Cotización: ok | lenta | caida.  Modos de Envíos: ok | caida.
 */
public final class Servicios {
  private static volatile String modoEnvios = "ok";
  private static volatile String modoCotizacion = "ok";
  private static final AtomicInteger LLAMADAS_COTIZACION = new AtomicInteger();

  private static final List<Map<String, String>> ENVIOS = List.of(
      Map.of("envioId", "E-1", "cliente", "Ferreteria Norte", "conductorId", "C-7", "direccion", "Cra 7 # 72-10",
          "ventana", "08:00-10:00", "estado", "PENDIENTE", "pesoKg", "#2.5", "zona", "Z03",
          "notasInternas", "cliente pide factura electronica"),
      Map.of("envioId", "E-2", "cliente", "Drogueria Sur", "conductorId", "C-7", "direccion", "Cl 45 # 13-20",
          "ventana", "10:00-12:00", "estado", "PENDIENTE", "pesoKg", "#1", "zona", "Z03",
          "notasInternas", "porteria cierra a las 12"),
      Map.of("envioId", "E-3", "cliente", "Libreria Centro", "conductorId", "C-9", "direccion", "Av 19 # 100-05",
          "ventana", "14:00-16:00", "estado", "ENTREGADO", "pesoKg", "#5", "zona", "Z01",
          "notasInternas", "sin novedades"));

  private Servicios() { }

  public static void main(String[] args) throws IOException {
    for (String arg : args) {
      if (arg.startsWith("--cotizacion=")) modoCotizacion = arg.substring(13);
      if (arg.startsWith("--envios=")) modoEnvios = arg.substring(9);
    }
    var envios = HttpServer.create(new InetSocketAddress("127.0.0.1", 8091), 64);
    envios.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    envios.createContext("/envios", Servicios::envios);
    envios.createContext("/admin/modo", ex -> { modoEnvios = HttpUtil.query(ex).get("valor"); modo(ex); });
    envios.start();
    var cotizacion = HttpServer.create(new InetSocketAddress("127.0.0.1", 8092), 64);
    cotizacion.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    cotizacion.createContext("/cotizaciones", Servicios::cotizacion);
    cotizacion.createContext("/admin/modo", ex -> { modoCotizacion = HttpUtil.query(ex).get("valor"); modo(ex); });
    cotizacion.start();
    System.out.println("ENVIOS http://127.0.0.1:8091 modo=" + modoEnvios
        + " | COTIZACION http://127.0.0.1:8092 modo=" + modoCotizacion);
  }

  private static void modo(HttpExchange ex) throws IOException {
    System.out.println("MODO envios=" + modoEnvios + " cotizacion=" + modoCotizacion);
    HttpUtil.json(ex, 200, "{\"envios\":\"" + modoEnvios + "\",\"cotizacion\":\"" + modoCotizacion + "\"}");
  }

  private static void envios(HttpExchange ex) throws IOException {
    dormir(150);
    if (modoEnvios.equals("caida")) { HttpUtil.json(ex, 503, "{\"error\":\"ENVIOS_NO_DISPONIBLE\"}"); return; }
    String conductor = HttpUtil.query(ex).get("conductor");
    var filtrados = ENVIOS.stream()
        .filter(e -> conductor == null || e.get("conductorId").equals(conductor))
        .map(e -> new java.util.TreeMap<>(e)).map(m -> (Map<String, String>) m).toList();
    HttpUtil.json(ex, 200, JsonPlano.escribirLista(filtrados));
  }

  private static void cotizacion(HttpExchange ex) throws IOException {
    int n = LLAMADAS_COTIZACION.incrementAndGet();
    System.out.println("COTIZACION llamada " + n + " " + ex.getRequestURI().getPath());
    if (modoCotizacion.equals("caida")) { HttpUtil.json(ex, 503, "{\"error\":\"COTIZACION_NO_DISPONIBLE\"}"); return; }
    dormir(modoCotizacion.equals("lenta") ? 3000 : 250);
    String envioId = ex.getRequestURI().getPath().substring("/cotizaciones/".length());
    long total = switch (envioId) { case "E-1" -> 8126; case "E-2" -> 6251; default -> 8900; };
    HttpUtil.json(ex, 200, "{\"envioId\":\"" + envioId + "\",\"totalCop\":" + total + "}");
  }

  private static void dormir(long ms) {
    try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
  }
}
