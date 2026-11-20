// F054 · Config Server por dentro: un servidor de configuración y un cliente que la refresca (solo JDK 25).
// Ejecuta: java ConfigCentral.java
// Qué demuestra: (1) el orden de precedencia {app}-{perfil} > {app} > application que usa Spring
// Cloud Config, (2) que cambiar el repositorio no cambia al cliente hasta que refresca, y
// (3) qué pasa si el servidor no está: fail-fast frente a valores locales de respaldo.
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;

public class ConfigCentral {

    // El "repositorio Git" del servidor: un archivo por nombre (application, catalogo, catalogo-prod).
    static final Map<String, Map<String, String>> REPO = new ConcurrentHashMap<>();

    public static void main(String[] args) throws Exception {
        REPO.put("application", Map.of("tienda.moneda", "COP", "catalogo.pagina", "10"));
        REPO.put("catalogo", Map.of("catalogo.pagina", "20"));
        REPO.put("catalogo-prod", Map.of("catalogo.pagina", "50", "catalogo.banner", "Black Friday"));

        HttpServer servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        // GET /{app}/{perfil}: mezcla de menor a mayor prioridad, como el Config Server.
        servidor.createContext("/", ex -> {
            String[] p = ex.getRequestURI().getPath().split("/");   // ["", app, perfil]
            Map<String, String> mezcla = new TreeMap<>();
            for (String fuente : new String[] {"application", p[1], p[1] + "-" + p[2]}) {
                mezcla.putAll(REPO.getOrDefault(fuente, Map.of()));  // la última fuente gana
            }
            byte[] b = mezcla.toString().getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        servidor.start();
        String url = "http://127.0.0.1:" + servidor.getAddress().getPort();

        Cliente dev = new Cliente(url, "catalogo", "default");
        Cliente prod = new Cliente(url, "catalogo", "prod");
        System.out.println("catalogo/default -> " + dev.config);
        System.out.println("catalogo/prod    -> " + prod.config);

        // Alguien cambia el repositorio (git push). El cliente sigue con lo que cargó al arrancar.
        REPO.put("catalogo-prod", Map.of("catalogo.pagina", "80", "catalogo.banner", "Cyber Monday"));
        System.out.println("tras el push, sin refrescar: catalogo.pagina=" + prod.config.get("catalogo.pagina"));
        prod.refrescar();                                           // POST /actuator/refresh en Spring
        System.out.println("tras refrescar:              catalogo.pagina=" + prod.config.get("catalogo.pagina"));

        servidor.stop(0);                                           // el Config Server se cae
        String failFast;
        try {
            new Cliente(url, "catalogo", "prod");
            failFast = "arrancó";
        } catch (IllegalStateException e) {
            failFast = e.getMessage();
        }
        System.out.println("arranque sin servidor (fail-fast): " + failFast);

        boolean ok = "20".equals(dev.config.get("catalogo.pagina")) && "COP".equals(dev.config.get("tienda.moneda"))
            && "80".equals(prod.config.get("catalogo.pagina")) && failFast.startsWith("no pude leer");
        System.out.println(ok ? "OK: precedencia, refresco y fail-fast comprobados" : "FALLA");
        System.exit(ok ? 0 : 1);
    }

    /** Cliente mínimo: lee su configuración al arrancar y solo la cambia al refrescar. */
    static class Cliente {
        final String url, app, perfil;
        Map<String, String> config = new LinkedHashMap<>();
        final HttpClient http = HttpClient.newHttpClient();

        Cliente(String url, String app, String perfil) {
            this.url = url; this.app = app; this.perfil = perfil;
            refrescar();
        }

        void refrescar() {
            try {
                String cuerpo = http.send(HttpRequest.newBuilder(URI.create(url + "/" + app + "/" + perfil)).build(),
                                          HttpResponse.BodyHandlers.ofString()).body();
                Map<String, String> nueva = new TreeMap<>();
                for (String par : cuerpo.substring(1, cuerpo.length() - 1).split(", ")) {
                    String[] kv = par.split("=", 2);
                    nueva.put(kv[0], kv[1]);
                }
                config = nueva;
            } catch (Exception e) {
                throw new IllegalStateException("no pude leer " + app + "/" + perfil + " del Config Server: "
                        + e.getClass().getSimpleName());
            }
        }
    }
}
