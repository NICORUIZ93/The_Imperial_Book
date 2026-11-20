// F056 · BFF por dentro: un backend para la app móvil y otro para la web (solo JDK 25).
// Ejecuta: java Bff.java
// Qué demuestra: con los mismos tres servicios, el BFF móvil compone una respuesta pequeña
// (2 llamadas en paralelo) y el BFF web una completa (3 llamadas en paralelo). Mide bytes y tiempo.
// java Bff.java --secuencial  -> el error común: las llamadas una tras otra (la latencia se suma).
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public class Bff {

    static final HttpClient HTTP = HttpClient.newHttpClient();
    static String catalogo, inventario, resenas;
    static boolean secuencial;

    public static void main(String[] args) throws Exception {
        secuencial = args.length > 0 && args[0].equals("--secuencial");
        // Servicios de dominio con su latencia simulada.
        catalogo = servicio(150, """
            {"id":7,"nombre":"Audífonos BT","precio":189000,"descripcion":"Audífonos inalámbricos con \
            cancelación de ruido, 30 horas de batería y estuche de carga rápida USB-C.",\
            "imagenes":["a.jpg","b.jpg","c.jpg","d.jpg","e.jpg"],\
            "especificaciones":{"peso":"250 g","bluetooth":"5.4","garantia":"12 meses"}}""");
        inventario = servicio(100, "{\"sku\":7,\"stock\":12,\"bodega\":\"BOG-1\"}");
        resenas = servicio(200, "{\"promedio\":4.6,\"total\":318,\"ultimas\":[\"Muy buenos\",\"Buena batería\"]}");

        bffWeb(7);                                  // calentamiento: la 1.ª llamada de la JVM es más lenta
        long t0 = System.nanoTime();
        String movil = bffMovil(7);
        long msMovil = (System.nanoTime() - t0) / 1_000_000;
        t0 = System.nanoTime();
        String web = bffWeb(7);
        long msWeb = (System.nanoTime() - t0) / 1_000_000;

        System.out.println("BFF móvil (" + bytes(movil) + " bytes, " + msMovil + " ms): " + movil);
        System.out.println("BFF web   (" + bytes(web) + " bytes, " + msWeb + " ms)");
        if (secuencial) {
            System.out.println("FALLA (esperada con --secuencial): la latencia es la SUMA de las llamadas");
            System.exit(1);
        }
        boolean ok = bytes(movil) < bytes(web) / 3 && msMovil < 240 && msWeb < 400 && msWeb >= 200 && movil.contains("\"stock\":12");
        System.out.println(ok ? "OK: cada cliente recibe solo lo que su pantalla necesita, en paralelo" : "FALLA");
        System.exit(ok ? 0 : 1);
    }

    /** Móvil: nombre, precio, stock y UNA imagen. Catálogo e inventario en paralelo. */
    static String bffMovil(int id) {
        var producto = get(catalogo + "/productos/" + id);
        if (secuencial) producto.join();                 // ERROR: espera al catálogo antes de pedir el stock
        var stock = get(inventario + "/stock/" + id);
        String p = producto.join(), s = stock.join();
        return "{\"id\":" + id + ",\"nombre\":" + campo(p, "nombre") + ",\"precio\":" + campo(p, "precio")
            + ",\"stock\":" + campo(s, "stock") + ",\"imagen\":\"a.jpg\"}";
    }

    /** Web: el producto completo, el stock por bodega y las reseñas. Tres llamadas en paralelo. */
    static String bffWeb(int id) {
        var producto = get(catalogo + "/productos/" + id);
        if (secuencial) producto.join();
        var stock = get(inventario + "/stock/" + id);
        if (secuencial) stock.join();
        var opiniones = get(resenas + "/resenas/" + id);
        return "{\"producto\":" + producto.join() + ",\"inventario\":" + stock.join()
            + ",\"resenas\":" + opiniones.join() + "}";
    }

    static CompletableFuture<String> get(String url) {
        return HTTP.sendAsync(HttpRequest.newBuilder(URI.create(url)).build(), HttpResponse.BodyHandlers.ofString())
                   .thenApply(HttpResponse::body);
    }

    /** Extrae un valor simple de un JSON plano (en Spring lo hace Jackson). */
    static String campo(String json, String nombre) {
        int i = json.indexOf("\"" + nombre + "\":") + nombre.length() + 3;
        int fin = i;
        while (fin < json.length() && json.charAt(fin) != ',' && json.charAt(fin) != '}') fin++;
        return json.substring(i, fin);
    }

    static int bytes(String s) { return s.getBytes(StandardCharsets.UTF_8).length; }

    static String servicio(int latenciaMs, String cuerpo) throws Exception {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.setExecutor(java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor());
        s.createContext("/", ex -> {
            try { Thread.sleep(latenciaMs); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            byte[] b = cuerpo.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        s.start();
        return "http://127.0.0.1:" + s.getAddress().getPort();
    }
}
