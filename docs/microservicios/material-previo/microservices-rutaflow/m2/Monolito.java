import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.InetSocketAddress;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * M2 · Monolito RutaFlow en 127.0.0.1:8081 (sistema heredado).
 * Rutas: GET /envios/{id}, POST /cotizaciones, GET /cotizaciones-pdf/{id}, GET /legacy/tarifas/{zona}.
 */
public final class Monolito {
  record TarifaHeredada(String tarifaPorKg, long base, boolean activa) { }

  private static final Map<String, TarifaHeredada> TARIFAS_ZONA = Map.of(
      "Z01", new TarifaHeredada("980,00", 4000, true),
      "Z03", new TarifaHeredada("1250,50", 5000, true),
      "Z07", new TarifaHeredada("2100,75", 9000, false));
  private static final AtomicInteger SECUENCIA = new AtomicInteger();

  private Monolito() { }

  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8081), 32);
    server.createContext("/", Monolito::atender);
    server.start();
    System.out.println("MONOLITO http://127.0.0.1:8081");
  }

  private static void atender(HttpExchange ex) throws IOException {
    String ruta = ex.getRequestURI().getPath();
    System.out.println("MONOLITO " + ex.getRequestMethod() + " " + ruta);
    if (ruta.startsWith("/envios/")) {
      String id = ruta.substring("/envios/".length());
      HttpUtil.responder(ex, 200, "application/json",
          "{\"envioId\":\"" + id + "\",\"estado\":\"EN_TRANSITO\"}", "monolito");
    } else if (ruta.equals("/cotizaciones") && ex.getRequestMethod().equals("POST")) {
      cotizar(ex);
    } else if (ruta.startsWith("/cotizaciones-pdf/")) {
      HttpUtil.responder(ex, 200, "text/plain", "PDF heredado de " + ruta.substring(18), "monolito");
    } else if (ruta.startsWith("/legacy/tarifas/")) {
      String zona = ruta.substring("/legacy/tarifas/".length());
      TarifaHeredada t = TARIFAS_ZONA.get(zona);
      if (t == null) { HttpUtil.responder(ex, 404, "text/plain", "", "monolito"); return; }
      HttpUtil.responder(ex, 200, "text/plain", "COD_ZONA=" + zona + "|TARIFA_X_KG=" + t.tarifaPorKg()
          + "|BASE=" + t.base() + "|IND_ACTIVO=" + (t.activa() ? "S" : "N"), "monolito");
    } else {
      HttpUtil.responder(ex, 404, "text/plain", "", "monolito");
    }
  }

  private static void cotizar(HttpExchange ex) throws IOException {
    var campos = HttpUtil.formulario(HttpUtil.leerCuerpo(ex));
    TarifaHeredada t = TARIFAS_ZONA.get(campos.getOrDefault("zona", ""));
    if (t == null || !t.activa()) {
      HttpUtil.responder(ex, 422, "application/json", "{\"error\":\"ZONA_NO_COTIZABLE\"}", "monolito");
      return;
    }
    BigDecimal peso = new BigDecimal(campos.getOrDefault("pesoKg", "0"));
    BigDecimal total = new BigDecimal(t.tarifaPorKg().replace(',', '.')).multiply(peso)
        .add(BigDecimal.valueOf(t.base())).setScale(0, RoundingMode.HALF_UP);
    HttpUtil.responder(ex, 200, "application/json", "{\"cotizacionId\":\"M-" + SECUENCIA.incrementAndGet()
        + "\",\"totalCop\":" + total.toPlainString() + "}", "monolito");
  }
}
