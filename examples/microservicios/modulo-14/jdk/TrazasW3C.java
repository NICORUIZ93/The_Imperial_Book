// F071 · OpenTelemetry + Zipkin/Jaeger — trazas distribuidas a mano con JDK 25.
// pedidos (:A) recibe una petición y llama a inventario (:B). Cada servicio registra "spans";
// la cabecera W3C "traceparent" (00-<trace-id>-<span-id>-<flags>) une los spans de ambos en UNA traza.
// ANTES: pedidos no propaga traceparent -> dos trazas sueltas.  DESPUÉS: una traza con 3 spans.
// Ejecuta:  java TrazasW3C.java
//           ZIPKIN_URL=http://localhost:9411 java TrazasW3C.java   (además envía los spans a Zipkin)
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class TrazasW3C {

    record Span(String traceId, String spanId, String parentId, String nombre, String servicio, String tipo,
                long inicioMicros, long duracionMicros) { }

    static final Pattern TRACEPARENT = Pattern.compile("^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$");
    static final SecureRandom AZAR = new SecureRandom();
    static final List<Span> spans = new CopyOnWriteArrayList<>();
    static final HttpClient HTTP = HttpClient.newHttpClient();
    static volatile boolean propagar;

    static String hex(int bytes) { byte[] b = new byte[bytes]; AZAR.nextBytes(b); return HexFormat.of().formatHex(b); }
    static long ahoraMicros() { return System.currentTimeMillis() * 1000; }

    /** Contexto entrante: si la petición trae un traceparent válido, el span nuevo es su hijo. */
    static String[] contexto(HttpExchange ex) {
        String tp = ex.getRequestHeaders().getFirst("traceparent");
        var m = tp == null ? null : TRACEPARENT.matcher(tp);
        if (m != null && m.matches() && !m.group(1).equals("0".repeat(32))) return new String[] {m.group(1), m.group(2)};
        return new String[] {hex(16), null};                              // raíz: trace-id nuevo
    }

    static void responder(HttpExchange ex, String cuerpo) throws IOException {
        byte[] b = cuerpo.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(200, b.length);
        ex.getResponseBody().write(b);
        ex.close();
    }

    static HttpServer inventario() throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.createContext("/stock", ex -> {
            String[] ctx = contexto(ex);
            long t0 = ahoraMicros();
            String spanId = hex(8);
            try { Thread.sleep(30); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            spans.add(new Span(ctx[0], spanId, ctx[1], "GET /stock/{sku}", "inventario", "SERVER", t0, ahoraMicros() - t0));
            responder(ex, "{\"sku\":\"CAFE-1\",\"stock\":12}");
        });
        s.start();
        return s;
    }

    static HttpServer pedidos(int puertoInventario) throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.createContext("/pedidos", ex -> {
            String[] ctx = contexto(ex);
            long t0 = ahoraMicros();
            String servidor = hex(8), cliente = hex(8);
            var req = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + puertoInventario + "/stock/CAFE-1"));
            if (propagar) req.header("traceparent", "00-" + ctx[0] + "-" + cliente + "-01");   // inyectar
            long t1 = ahoraMicros();
            try {
                HTTP.send(req.build(), HttpResponse.BodyHandlers.ofString());
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            spans.add(new Span(ctx[0], cliente, servidor, "GET inventario /stock", "pedidos", "CLIENT", t1, ahoraMicros() - t1));
            try { Thread.sleep(10); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            spans.add(new Span(ctx[0], servidor, ctx[1], "POST /pedidos", "pedidos", "SERVER", t0, ahoraMicros() - t0));
            responder(ex, "{\"pedido\":\"P-7\",\"estado\":\"confirmado\"}");
        });
        s.start();
        return s;
    }

    static void imprimirArbol(List<Span> lista) {
        Map<String, List<Span>> porTraza = lista.stream().collect(Collectors.groupingBy(Span::traceId));
        porTraza.forEach((traza, ss) -> {
            System.out.println("  traza " + traza.substring(0, 8) + "… (" + ss.size() + " spans)");
            ss.stream().filter(x -> x.parentId() == null || ss.stream().noneMatch(p -> p.spanId().equals(x.parentId())))
                    .forEach(raiz -> rama(raiz, ss, "    "));
        });
    }

    static void rama(Span s, List<Span> ss, String sangria) {
        System.out.printf("%s%-10s %-6s %-24s %s%n", sangria, s.servicio(), s.tipo(), s.nombre(),
                s.duracionMicros() / 1000 >= 25 ? "≥ 25 ms" : "< 25 ms");
        ss.stream().filter(h -> s.spanId().equals(h.parentId())).forEach(h -> rama(h, ss, sangria + "  "));
    }

    static String zipkinJson(List<Span> lista) {
        return lista.stream().map(s -> "{\"traceId\":\"" + s.traceId() + "\",\"id\":\"" + s.spanId() + "\","
                + (s.parentId() == null ? "" : "\"parentId\":\"" + s.parentId() + "\",")
                + "\"name\":\"" + s.nombre() + "\",\"kind\":\"" + s.tipo() + "\",\"timestamp\":" + s.inicioMicros()
                + ",\"duration\":" + Math.max(1, s.duracionMicros()) + ",\"localEndpoint\":{\"serviceName\":\"" + s.servicio() + "\"}}")
                .collect(Collectors.joining(",", "[", "]"));
    }

    public static void main(String[] args) throws Exception {
        HttpServer inv = inventario();
        HttpServer ped = pedidos(inv.getAddress().getPort());
        String url = "http://127.0.0.1:" + ped.getAddress().getPort() + "/pedidos";
        int fallos = 0;

        propagar = false;
        HTTP.send(HttpRequest.newBuilder(URI.create(url)).POST(HttpRequest.BodyPublishers.noBody()).build(),
                HttpResponse.BodyHandlers.ofString());
        long trazasAntes = spans.stream().map(Span::traceId).distinct().count();
        System.out.println("ANTES (sin propagar traceparent): " + trazasAntes + " trazas sueltas");
        imprimirArbol(spans);
        if (trazasAntes != 2) fallos++;
        spans.clear();

        propagar = true;
        String entrante = "00-" + hex(16) + "-" + hex(8) + "-01";               // como si viniera del gateway
        HTTP.send(HttpRequest.newBuilder(URI.create(url)).header("traceparent", entrante)
                .POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
        long trazas = spans.stream().map(Span::traceId).distinct().count();
        boolean mismoTrace = spans.stream().allMatch(s -> s.traceId().equals(entrante.substring(3, 35)));
        System.out.println("DESPUÉS (propagando W3C traceparent): " + trazas + " traza con " + spans.size() + " spans");
        imprimirArbol(spans);
        System.out.println("  el trace-id es el del traceparent entrante (" + entrante.substring(0, 12) + "…): " + mismoTrace);
        if (trazas != 1 || spans.size() != 3 || !mismoTrace) fallos++;

        Files.createDirectories(Path.of("target"));
        String json = zipkinJson(spans);
        Files.writeString(Path.of("target/spans-zipkin.json"), json);
        String zipkin = System.getenv("ZIPKIN_URL");
        if (zipkin != null) {
            var r = HTTP.send(HttpRequest.newBuilder(URI.create(zipkin + "/api/v2/spans"))
                    .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json)).build(),
                    HttpResponse.BodyHandlers.ofString());
            System.out.println("POST " + zipkin + "/api/v2/spans -> " + r.statusCode() + " · abre "
                    + zipkin + "/zipkin/traces/" + spans.get(0).traceId());
            if (r.statusCode() != 202) fallos++;
        }
        ped.stop(0);
        inv.stop(0);
        System.out.println(fallos == 0 ? "OK: una sola traza cruza los dos servicios" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
