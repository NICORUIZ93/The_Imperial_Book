// F070 · Micrometer + Prometheus — lo que hacen por dentro, solo con JDK 25.
// Un registro mínimo de métricas (contador + histograma con buckets), expuesto en /metrics con el
// formato de texto de Prometheus, y un "scrape" como el que hace Prometheus cada pocos segundos.
// ANTES: la etiqueta uri lleva el id real (/pedidos/123) -> una serie nueva por pedido (cardinalidad).
// DESPUÉS: la etiqueta uri lleva la plantilla (/pedidos/{id}) -> series acotadas.
// Ejecuta:  java MetricasPrometheus.java      (escribe target/metrics.txt)
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.atomic.DoubleAdder;
import java.util.concurrent.atomic.LongAdder;

public class MetricasPrometheus {

    static final double[] BUCKETS = {0.05, 0.1, 0.25, 0.5, 1.0};   // + "+Inf" implícito

    // Un histograma por combinación de etiquetas: contadores ACUMULADOS por bucket (le = "menor o igual que").
    static class Histograma {
        final LongAdder[] buckets = new LongAdder[BUCKETS.length + 1];
        final DoubleAdder suma = new DoubleAdder();
        Histograma() { for (int i = 0; i < buckets.length; i++) buckets[i] = new LongAdder(); }
        void observar(double segundos) {
            for (int i = 0; i < BUCKETS.length; i++) if (segundos <= BUCKETS[i]) buckets[i].increment();
            buckets[BUCKETS.length].increment();                            // +Inf cuenta todo
            suma.add(segundos);
        }
    }

    final Map<String, Histograma> latencias = new ConcurrentSkipListMap<>();
    final Map<String, LongAdder> pedidosCreados = new ConcurrentSkipListMap<>();

    void registrarPeticion(String metodo, String uri, int status, double segundos) {
        String etiquetas = "method=\"" + metodo + "\",uri=\"" + uri + "\",status=\"" + status + "\"";
        latencias.computeIfAbsent(etiquetas, k -> new Histograma()).observar(segundos);
    }

    void pedidoCreado(String canal) {
        pedidosCreados.computeIfAbsent("canal=\"" + canal + "\"", k -> new LongAdder()).increment();
    }

    static String numero(double d) { return d == Math.rint(d) ? String.format("%.1f", d) : Double.toString(d); }

    // Formato de exposición de texto de Prometheus (version=0.0.4).
    String exponer() {
        StringBuilder sb = new StringBuilder();
        sb.append("# HELP http_server_requests_seconds Duración de las peticiones HTTP\n");
        sb.append("# TYPE http_server_requests_seconds histogram\n");
        for (var e : latencias.entrySet()) {
            Histograma h = e.getValue();
            for (int i = 0; i <= BUCKETS.length; i++) {
                String le = i < BUCKETS.length ? Double.toString(BUCKETS[i]) : "+Inf";
                sb.append("http_server_requests_seconds_bucket{").append(e.getKey()).append(",le=\"").append(le)
                  .append("\"} ").append(h.buckets[i].sum()).append('\n');
            }
            sb.append("http_server_requests_seconds_sum{").append(e.getKey()).append("} ")
              .append(numero(Math.round(h.suma.sum() * 1000) / 1000.0)).append('\n');
            sb.append("http_server_requests_seconds_count{").append(e.getKey()).append("} ")
              .append(h.buckets[BUCKETS.length].sum()).append('\n');
        }
        sb.append("# HELP pedidos_creados_total Pedidos creados por canal\n");
        sb.append("# TYPE pedidos_creados_total counter\n");
        for (var e : pedidosCreados.entrySet()) {
            sb.append("pedidos_creados_total{").append(e.getKey()).append("} ").append(numero(e.getValue().sum())).append('\n');
        }
        return sb.toString();
    }

    long series() { return latencias.size() * (BUCKETS.length + 3L) + pedidosCreados.size(); }

    // Latencia simulada y determinista: 1 de cada 50 pedidos es lento.
    static double latencia(int id) { return id % 50 == 0 ? 0.8 : 0.02 + (id % 7) * 0.01; }

    public static void main(String[] args) throws Exception {
        int fallos = 0;

        MetricasPrometheus antes = new MetricasPrometheus();
        for (int id = 1; id <= 1000; id++) antes.registrarPeticion("GET", "/pedidos/" + id, 200, latencia(id));
        System.out.println("ANTES (vulnerable): uri con el id real");
        System.out.println("  1000 peticiones -> " + antes.latencias.size() + " combinaciones de etiquetas -> "
                + antes.series() + " series en Prometheus (crece con cada pedido nuevo)");

        MetricasPrometheus despues = new MetricasPrometheus();
        for (int id = 1; id <= 1000; id++) despues.registrarPeticion("GET", "/pedidos/{id}", 200, latencia(id));
        for (int i = 0; i < 3; i++) despues.registrarPeticion("GET", "/pedidos/{id}", 404, 0.004);
        for (int i = 0; i < 40; i++) despues.pedidoCreado(i % 4 == 0 ? "app" : "web");
        System.out.println("DESPUÉS (seguro): uri con la plantilla");
        System.out.println("  1003 peticiones -> " + despues.latencias.size() + " combinaciones de etiquetas -> "
                + despues.series() + " series (no crece con el número de pedidos)");
        if (antes.series() <= 1000 || despues.series() > 20) fallos++;

        // /metrics servido por HTTP y leído como lo haría Prometheus.
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.createContext("/metrics", ex -> {
            byte[] b = despues.exponer().getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
            ex.sendResponseHeaders(200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        s.start();
        HttpResponse<String> scrape = HttpClient.newHttpClient().send(HttpRequest.newBuilder(
                URI.create("http://127.0.0.1:" + s.getAddress().getPort() + "/metrics")).build(),
                HttpResponse.BodyHandlers.ofString());
        s.stop(0);
        System.out.println("GET /metrics -> " + scrape.statusCode() + " " + scrape.headers().firstValue("Content-Type").orElse(""));
        Files.createDirectories(Path.of("target"));
        Files.writeString(Path.of("target/metrics.txt"), scrape.body());
        scrape.body().lines().filter(l -> l.contains("status=\"200\"") || l.startsWith("pedidos_creados") || l.startsWith("# TYPE"))
                .forEach(l -> System.out.println("  " + l));

        // Comprobaciones: buckets acumulados y +Inf == count.
        Map<String, Long> b = new TreeMap<>();
        scrape.body().lines().filter(l -> l.startsWith("http_server_requests_seconds_bucket") && l.contains("status=\"200\""))
                .forEach(l -> b.put(l.replaceAll(".*le=\"([^\"]+)\".*", "$1"), Long.parseLong(l.substring(l.lastIndexOf(' ') + 1))));
        boolean acumulado = b.get("0.05") <= b.get("0.1") && b.get("0.1") <= b.get("0.25") && b.get("1.0") <= b.get("+Inf");
        boolean infIgualCount = scrape.body().contains("http_server_requests_seconds_count{method=\"GET\",uri=\"/pedidos/{id}\",status=\"200\"} " + b.get("+Inf"));
        System.out.println("buckets acumulados: " + acumulado + " · bucket +Inf == _count: " + infIgualCount);
        if (!acumulado || !infIgualCount) fallos++;
        System.out.println(fallos == 0 ? "OK: exposición válida y cardinalidad acotada" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
