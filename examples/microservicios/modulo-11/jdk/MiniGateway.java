// F053 · API Gateway por dentro: tabla de rutas, StripPrefix y X-Request-Id (solo JDK 25).
// Ejecuta: java MiniGateway.java
// Qué demuestra: un único punto de entrada que enruta por prefijo, quita el prefijo antes de
// reenviar, añade un identificador de petición y responde 404 a lo que no tiene ruta.
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class MiniGateway {

    public static void main(String[] args) throws Exception {
        // Dos servicios de juguete que responden qué ruta y qué X-Request-Id les llegó.
        HttpServer catalogo = backend("catalogo");
        HttpServer inventario = backend("inventario");

        // Tabla de rutas: prefijo público -> servicio interno (lo que en Spring Cloud Gateway es
        // "predicates: Path=/api/catalogo/**" + "filters: StripPrefix=2").
        Map<String, String> rutas = new LinkedHashMap<>();
        rutas.put("/api/catalogo/", "http://127.0.0.1:" + catalogo.getAddress().getPort());
        rutas.put("/api/inventario/", "http://127.0.0.1:" + inventario.getAddress().getPort());

        HttpClient http = HttpClient.newHttpClient();
        HttpServer gateway = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        gateway.createContext("/", ex -> {
            String ruta = ex.getRequestURI().getPath();
            String destino = rutas.entrySet().stream()
                .filter(r -> ruta.startsWith(r.getKey()))
                .map(r -> r.getValue() + "/" + ruta.substring(r.getKey().length()))   // StripPrefix=2
                .findFirst().orElse(null);
            if (destino == null) {
                responder(ex, 404, "{\"error\":\"SIN_RUTA\",\"ruta\":\"" + ruta + "\"}");
                return;
            }
            String id = ex.getRequestHeaders().getFirst("X-Request-Id");
            if (id == null) id = UUID.randomUUID().toString();             // filtro global
            try {
                HttpResponse<String> r = http.send(HttpRequest.newBuilder(URI.create(destino))
                        .header("X-Request-Id", id).build(), HttpResponse.BodyHandlers.ofString());
                ex.getResponseHeaders().add("X-Request-Id", id);
                responder(ex, r.statusCode(), r.body());
            } catch (Exception e) {
                responder(ex, 502, "{\"error\":\"SERVICIO_NO_RESPONDE\"}");
            }
        });
        gateway.start();
        String gw = "http://127.0.0.1:" + gateway.getAddress().getPort();

        int fallos = 0;
        fallos += probar(http, gw + "/api/catalogo/productos/7", "req-001", 200, "catalogo recibió /productos/7 con X-Request-Id=req-001");
        fallos += probar(http, gw + "/api/inventario/stock/7", "req-002", 200, "inventario recibió /stock/7 con X-Request-Id=req-002");
        fallos += probar(http, gw + "/api/pagos/1", "req-003", 404, "SIN_RUTA");
        inventario.stop(0);                                                // apagamos un servicio
        fallos += probar(http, gw + "/api/inventario/stock/7", "req-004", 502, "SERVICIO_NO_RESPONDE");

        gateway.stop(0);
        catalogo.stop(0);
        System.out.println(fallos == 0 ? "OK: el gateway enruta, quita el prefijo y propaga X-Request-Id" : "FALLA");
        System.exit(fallos == 0 ? 0 : 1);
    }

    static int probar(HttpClient http, String url, String id, int estado, String esperado) throws Exception {
        HttpResponse<String> r = http.send(HttpRequest.newBuilder(URI.create(url)).header("X-Request-Id", id).build(),
                                           HttpResponse.BodyHandlers.ofString());
        String ruta = URI.create(url).getPath();
        System.out.printf("GET %-26s -> %d %s%n", ruta, r.statusCode(), r.body());
        return r.statusCode() == estado && r.body().contains(esperado) ? 0 : 1;
    }

    static HttpServer backend(String nombre) throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.createContext("/", ex -> responder(ex, 200, nombre + " recibió " + ex.getRequestURI().getPath()
                + " con X-Request-Id=" + ex.getRequestHeaders().getFirst("X-Request-Id")));
        s.start();
        return s;
    }

    static void responder(HttpExchange ex, int estado, String cuerpo) throws IOException {
        byte[] b = cuerpo.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(estado, b.length);
        ex.getResponseBody().write(b);
        ex.close();
    }
}
