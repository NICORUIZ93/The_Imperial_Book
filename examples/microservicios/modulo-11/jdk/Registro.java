// F052 · Service Discovery por dentro: un registro mínimo con latidos y expulsión (solo JDK 25).
// Ejecuta: java Registro.java
// Qué demuestra: las instancias se registran, mandan latidos y el registro expulsa
// a la que deja de latir (lo mismo que hacen Eureka con sus "leases" y Consul con sus checks TTL).
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Registro {

    static final long TTL_MS = 3_000;                       // sin latido durante 3 s => fuera
    // servicio -> (idInstancia -> [url, instante del último latido])
    static final Map<String, Map<String, Object[]>> REGISTRO = new ConcurrentHashMap<>();

    public static void main(String[] args) throws Exception {
        HttpServer servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        // PUT /registro/{servicio}/{id}?url=...  registra o renueva (latido)
        servidor.createContext("/registro/", ex -> {
            String[] partes = ex.getRequestURI().getPath().split("/"); // ["", "registro", servicio, id]
            String url = ex.getRequestURI().getQuery().substring("url=".length());
            REGISTRO.computeIfAbsent(partes[2], s -> new ConcurrentHashMap<>())
                    .put(partes[3], new Object[] {url, System.currentTimeMillis()});
            ex.sendResponseHeaders(204, -1);
            ex.close();
        });
        // GET /servicios/{servicio}  devuelve las instancias vivas como "id=url" separadas por coma
        servidor.createContext("/servicios/", ex -> {
            String servicio = ex.getRequestURI().getPath().substring("/servicios/".length());
            Map<String, String> vivas = new TreeMap<>();
            REGISTRO.getOrDefault(servicio, Map.of()).forEach((id, v) -> vivas.put(id, (String) v[0]));
            byte[] cuerpo = vivas.toString().getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, cuerpo.length);
            ex.getResponseBody().write(cuerpo);
            ex.close();
        });
        servidor.start();
        String base = "http://127.0.0.1:" + servidor.getAddress().getPort();

        // Expulsor: cada 500 ms borra las instancias cuyo último latido es más viejo que el TTL.
        var tareas = Executors.newScheduledThreadPool(2);
        tareas.scheduleAtFixedRate(() -> REGISTRO.values().forEach(instancias ->
            instancias.entrySet().removeIf(e -> {
                boolean vencida = System.currentTimeMillis() - (long) e.getValue()[1] > TTL_MS;
                if (vencida) System.out.println("[registro] expulsada " + e.getKey() + " (sin latido > " + TTL_MS + " ms)");
                return vencida;
            })), 500, 500, TimeUnit.MILLISECONDS);

        HttpClient http = HttpClient.newHttpClient();
        Runnable latido1 = () -> put(http, base + "/registro/catalogo/catalogo-1?url=http://10.0.0.11:8081");
        latido1.run();
        put(http, base + "/registro/catalogo/catalogo-2?url=http://10.0.0.12:8081"); // se registra y "muere"
        // catalogo-1 sigue latiendo cada segundo; catalogo-2 nunca vuelve a latir.
        tareas.scheduleAtFixedRate(latido1, 1, 1, TimeUnit.SECONDS);

        String antes = get(http, base + "/servicios/catalogo");
        System.out.println("t=0s   instancias de catalogo: " + antes);
        Thread.sleep(4_500);
        String despues = get(http, base + "/servicios/catalogo");
        System.out.println("t=4,5s instancias de catalogo: " + despues);

        tareas.shutdownNow();
        servidor.stop(0);
        if (!antes.contains("catalogo-2") || despues.contains("catalogo-2") || !despues.contains("catalogo-1")) {
            System.out.println("FALLA: el registro no expulsó a catalogo-2");
            System.exit(1);
        }
        System.out.println("OK: el cliente solo ve instancias que laten");
    }

    static void put(HttpClient http, String url) {
        try {
            http.send(HttpRequest.newBuilder(URI.create(url)).PUT(HttpRequest.BodyPublishers.noBody()).build(),
                      HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    static String get(HttpClient http, String url) throws Exception {
        return http.send(HttpRequest.newBuilder(URI.create(url)).build(), HttpResponse.BodyHandlers.ofString()).body();
    }
}
