// F055 · Balanceo de carga en el cliente por dentro: round-robin y filtro de instancias sanas (solo JDK 25).
// Ejecuta: java Balanceador.java
// Qué demuestra: (1) round-robin reparte 6 llamadas 2-2-2 entre 3 instancias, (2) si una instancia
// muere y el balanceador no lo sabe, 1 de cada 3 llamadas falla, (3) con un chequeo de salud
// (lo que hace .withHealthChecks() en Spring Cloud LoadBalancer) ya no falla ninguna.
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicInteger;

public class Balanceador {

    static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build();

    public static void main(String[] args) throws Exception {
        List<HttpServer> servidores = new ArrayList<>();
        List<String> instancias = new ArrayList<>();               // lo que devolvería el registro
        for (int i = 1; i <= 3; i++) {
            String nombre = "catalogo-" + i;
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/", ex -> {
                byte[] b = nombre.getBytes(StandardCharsets.UTF_8);
                ex.sendResponseHeaders(200, b.length);
                ex.getResponseBody().write(b);
                ex.close();
            });
            s.start();
            servidores.add(s);
            instancias.add("http://127.0.0.1:" + s.getAddress().getPort());
        }

        Map<String, Integer> r1 = repartir(new RoundRobin(instancias, false), 6);
        System.out.println("1) Las 3 vivas, round-robin:          " + r1);

        servidores.get(1).stop(0);                                 // catalogo-2 muere
        Map<String, Integer> r2 = repartir(new RoundRobin(instancias, false), 6);
        System.out.println("2) catalogo-2 caída, sin health check: " + r2);
        Map<String, Integer> r3 = repartir(new RoundRobin(instancias, true), 6);
        System.out.println("3) catalogo-2 caída, con health check: " + r3);

        servidores.forEach(s -> s.stop(0));
        boolean ok = r1.equals(Map.of("catalogo-1", 2, "catalogo-2", 2, "catalogo-3", 2))
            && r2.getOrDefault("ERROR", 0) == 2 && !r3.containsKey("ERROR");
        System.out.println(ok ? "OK: round-robin reparte y el health check evita la instancia caída" : "FALLA");
        System.exit(ok ? 0 : 1);
    }

    /** Hace n llamadas y cuenta quién respondió (o "ERROR"). */
    static Map<String, Integer> repartir(RoundRobin rr, int n) {
        Map<String, Integer> cuenta = new TreeMap<>();
        for (int i = 0; i < n; i++) {
            String quien;
            try {
                quien = HTTP.send(HttpRequest.newBuilder(URI.create(rr.elegir() + "/productos")).build(),
                                  HttpResponse.BodyHandlers.ofString()).body();
            } catch (Exception e) {
                quien = "ERROR";
            }
            cuenta.merge(quien, 1, Integer::sum);
        }
        return cuenta;
    }

    /** Round-robin como RoundRobinLoadBalancer: un contador atómico módulo el número de instancias. */
    static class RoundRobin {
        final List<String> instancias;
        final boolean conHealthCheck;
        final AtomicInteger posicion = new AtomicInteger();

        RoundRobin(List<String> instancias, boolean conHealthCheck) {
            this.instancias = instancias;
            this.conHealthCheck = conHealthCheck;
        }

        String elegir() {
            List<String> candidatas = conHealthCheck ? instancias.stream().filter(RoundRobin::sana).toList() : instancias;
            return candidatas.get(Math.floorMod(posicion.getAndIncrement(), candidatas.size()));
        }

        static boolean sana(String url) {                         // en Spring: GET /actuator/health
            try {
                return HTTP.send(HttpRequest.newBuilder(URI.create(url + "/actuator/health")).build(),
                                 HttpResponse.BodyHandlers.discarding()).statusCode() == 200;
            } catch (Exception e) {
                return false;
            }
        }
    }
}
