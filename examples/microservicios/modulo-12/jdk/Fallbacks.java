// F059 · Estrategias de fallback con el inventario caído (solo JDK 25).
// Ejecuta: java Fallbacks.java   (usa Inventario.java y ProxyDeFallos.java de esta carpeta)
// 1) valor por defecto explícito   2) último valor bueno (caché) con su edad
// 3) fuente alternativa (réplica)   4) fallar rápido cuando el dato es crítico
// 5) anti-patrón: un fallback que inventa un dato y engaña al usuario
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Fallbacks {

    static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build();
    record Guardado(String json, long instante) {}
    static final Map<String, Guardado> CACHE = new ConcurrentHashMap<>();
    static String principal, replica;

    public static void main(String[] args) throws Exception {
        var inventario = Inventario.arrancar("127.0.0.1", 0);
        var proxy = new ProxyDeFallos(inventario.getAddress().getPort());
        principal = proxy.url();
        var inventarioReplica = Inventario.arrancar("127.0.0.1", 0);        // otra instancia, otra zona
        replica = "http://127.0.0.1:" + inventarioReplica.getAddress().getPort();

        System.out.println("== Inventario sano");
        System.out.println("   consulta normal          -> " + conCache("7"));     // llena la caché
        Thread.sleep(300);
        proxy.caer();
        System.out.println("== Inventario caído (fallo inyectado: puerto cerrado)");
        String defecto = porDefecto("7");
        String cache = conCache("7");
        String alternativa = conReplica("7");
        String critico = reservar("7", 1);
        String mentiroso = mentiroso("7");
        System.out.println("   1) valor por defecto     -> " + defecto);
        System.out.println("   2) último valor bueno    -> " + cache);
        System.out.println("   3) fuente alternativa    -> " + alternativa);
        System.out.println("   4) reservar (crítico)    -> " + critico);
        System.out.println("   5) ANTI-PATRÓN mentiroso -> " + mentiroso);

        proxy.close(); inventario.stop(0); inventarioReplica.stop(0);
        boolean ok = defecto.contains("\"stock\":null") && cache.contains("\"fuente\":\"cache\"")
            && alternativa.contains("\"fuente\":\"replica\"") && critico.startsWith("503");
        System.out.println(ok ? "OK: cada fallback dice de dónde sale el dato; lo crítico falla rápido" : "FALLA");
        System.exit(ok ? 0 : 1);
    }

    static String get(String base, String sku) throws Exception {
        HttpResponse<String> r = HTTP.send(HttpRequest.newBuilder(URI.create(base + "/stock/" + sku))
            .timeout(Duration.ofMillis(300)).build(), HttpResponse.BodyHandlers.ofString());
        if (r.statusCode() != 200) throw new IllegalStateException("HTTP " + r.statusCode());
        return r.body();
    }

    /** 1) Un valor neutro y MARCADO: la pantalla muestra "consultar disponibilidad". */
    static String porDefecto(String sku) {
        try {
            return get(principal, sku);
        } catch (Exception e) {
            return "{\"sku\":\"" + sku + "\",\"stock\":null,\"fuente\":\"defecto\"}";
        }
    }

    /** 2) Guarda cada respuesta buena; si falla, devuelve la última con su edad. */
    static String conCache(String sku) {
        try {
            String json = get(principal, sku);
            CACHE.put(sku, new Guardado(json, System.currentTimeMillis()));
            return json;
        } catch (Exception e) {
            Guardado g = CACHE.get(sku);
            if (g == null) return porDefecto(sku);
            long edad = System.currentTimeMillis() - g.instante();
            return g.json().replace("}", ",\"fuente\":\"cache\",\"edad_ms\":" + (edad / 100 * 100) + "}");
        }
    }

    /** 3) Otra fuente que puede estar algo desactualizada (réplica de lectura, otra región). */
    static String conReplica(String sku) {
        try {
            return get(principal, sku);
        } catch (Exception e) {
            try {
                return get(replica, sku).replace("}", ",\"fuente\":\"replica\"}");
            } catch (Exception e2) {
                return porDefecto(sku);
            }
        }
    }

    /** 4) Reservar stock es una ESCRITURA crítica: sin inventario no hay reserva. Error claro y rápido. */
    static String reservar(String sku, int unidades) {
        long t0 = System.nanoTime();
        try {
            get(principal, sku);
            return "200 reservado";
        } catch (Exception e) {
            return "503 {\"error\":\"INVENTARIO_NO_DISPONIBLE\",\"reintentar_en_s\":30} en "
                + (System.nanoTime() - t0) / 1_000_000 + " ms";
        }
    }

    /** 5) NO lo hagas: inventa disponibilidad. El cliente compra algo que quizá no existe. */
    static String mentiroso(String sku) {
        try {
            return get(principal, sku);
        } catch (Exception e) {
            return "{\"sku\":\"" + sku + "\",\"stock\":99}   <- nadie sabe que es falso";
        }
    }
}
