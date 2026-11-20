// F060 · Un experimento de Chaos Engineering completo, con fallos inyectados por proxy (solo JDK 25).
// Ejecuta: java Caos.java   (usa Inventario.java y ProxyDeFallos.java de esta carpeta)
// Pasos del experimento: 1) medir el estado estable, 2) formular la hipótesis, 3) inyectar el fallo
// con radio de explosión acotado (solo inventario), 4) medir, 5) revertir y 6) concluir.
// Se ejecuta dos veces: contra un BFF sin protección (v1) y contra uno con timeout + fallback (v2).
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Executors;

public class Caos {

    static final HttpClient HTTP = HttpClient.newHttpClient();
    static final int PETICIONES = 10;
    static final long P95_MAXIMO_MS = 300;       // hipótesis del estado estable
    static String urlInventario;
    static volatile String ultimoStock = "null";

    public static void main(String[] args) throws Exception {
        var inventario = Inventario.arrancar("127.0.0.1", 0);
        var proxy = new ProxyDeFallos(inventario.getAddress().getPort());
        urlInventario = proxy.url();
        HttpServer v1 = bff(false), v2 = bff(true);

        boolean v1Confirmada = experimento("v1 sin protección", v1, proxy);
        boolean v2Confirmada = experimento("v2 timeout 200 ms + último valor bueno", v2, proxy);

        v1.stop(0); v2.stop(0); proxy.close(); inventario.stop(0);
        boolean ok = !v1Confirmada && v2Confirmada;
        System.out.println(ok ? "OK: el experimento encontró la debilidad de v1 y confirmó que v2 la corrige" : "FALLA");
        System.exit(ok ? 0 : 1);
    }

    static boolean experimento(String nombre, HttpServer bff, ProxyDeFallos proxy) throws Exception {
        String url = "http://127.0.0.1:" + bff.getAddress().getPort() + "/productos/7";
        System.out.println("== Experimento contra BFF " + nombre);
        medir(url);                                                       // calentamiento
        Medida estable = medir(url);
        System.out.println("   1. estado estable:  " + estable);
        System.out.println("   2. hipótesis: con +600 ms en inventario, p95 < " + P95_MAXIMO_MS + " ms y 0 errores");
        proxy.latencia(600);                                              // 3. inyectar (solo inventario)
        System.out.println("   3. inyectado: latencia de 600 ms en inventario (radio: solo ese proxy)");
        Medida conFallo;
        try {
            conFallo = medir(url);
        } finally {
            proxy.restablecer();                                          // 5. revertir SIEMPRE
        }
        System.out.println("   4. con el fallo:    " + conFallo);
        Medida despues = medir(url);
        System.out.println("   5. tras revertir:   " + despues);
        boolean confirmada = conFallo.p95() < P95_MAXIMO_MS && conFallo.errores() == 0;
        System.out.println("   6. hipótesis " + (confirmada ? "CONFIRMADA" : "REFUTADA: hay una debilidad que corregir"));
        return confirmada;
    }

    record Medida(long p95, int errores, int degradadas) {
        @Override public String toString() {
            return "p95=" + p95 + " ms, errores=" + errores + ", degradadas=" + degradadas + " de " + PETICIONES;
        }
    }

    static Medida medir(String url) {
        List<Long> tiempos = new ArrayList<>();
        int errores = 0, degradadas = 0;
        for (int i = 0; i < PETICIONES; i++) {
            long t0 = System.nanoTime();
            try {
                HttpResponse<String> r = HTTP.send(HttpRequest.newBuilder(URI.create(url)).build(),
                                                   HttpResponse.BodyHandlers.ofString());
                if (r.statusCode() >= 500) errores++;
                if (r.body().contains("\"degradado\":true")) degradadas++;
            } catch (Exception e) {
                errores++;
            }
            tiempos.add((System.nanoTime() - t0) / 1_000_000);
        }
        Collections.sort(tiempos);
        return new Medida(tiempos.get((int) Math.ceil(0.95 * tiempos.size()) - 1), errores, degradadas);
    }

    /** BFF de producto: v1 espera al inventario lo que haga falta; v2 espera 200 ms y degrada. */
    static HttpServer bff(boolean protegido) throws Exception {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        s.createContext("/productos/", ex -> {
            String cuerpo;
            try {
                HttpRequest.Builder req = HttpRequest.newBuilder(URI.create(urlInventario + "/stock/7"));
                if (protegido) req.timeout(Duration.ofMillis(200));
                String stock = HTTP.send(req.build(), HttpResponse.BodyHandlers.ofString()).body();
                ultimoStock = stock;
                cuerpo = "{\"id\":7,\"inventario\":" + stock + "}";
            } catch (Exception e) {
                cuerpo = "{\"id\":7,\"inventario\":" + ultimoStock + ",\"degradado\":true}";
            }
            byte[] b = cuerpo.getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        s.start();
        return s;
    }
}
