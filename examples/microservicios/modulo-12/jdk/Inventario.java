// Servicio "inventario" de los laboratorios del Módulo 8 (solo JDK 25).
// Ejecuta: java Inventario.java            -> escucha en 0.0.0.0:9000
// GET /stock/{sku} -> {"sku":"7","stock":12}   (cuenta las peticiones atendidas)
// FALLAR_PROXIMAS=n -> las n peticiones siguientes responden 503 (fallo de aplicación, no de red)
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class Inventario {

    public static final AtomicInteger ATENDIDAS = new AtomicInteger();
    public static final AtomicInteger FALLAR_PROXIMAS = new AtomicInteger();

    public static HttpServer arrancar(String host, int puerto) throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress(host, puerto), 0);
        s.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        s.createContext("/stock/", ex -> {
            ATENDIDAS.incrementAndGet();
            if (FALLAR_PROXIMAS.getAndUpdate(n -> Math.max(0, n - 1)) > 0) {
                byte[] b = "{\"error\":\"NO_DISPONIBLE\"}".getBytes(StandardCharsets.UTF_8);
                ex.sendResponseHeaders(503, b.length);
                ex.getResponseBody().write(b);
                ex.close();
                return;
            }
            String sku = ex.getRequestURI().getPath().substring("/stock/".length());
            byte[] b = ("{\"sku\":\"" + sku + "\",\"stock\":12}").getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        s.start();
        return s;
    }

    public static void main(String[] args) throws IOException {
        arrancar("0.0.0.0", args.length > 0 ? Integer.parseInt(args[0]) : 9000);
        System.out.println("inventario escuchando en :" + (args.length > 0 ? args[0] : "9000"));
    }
}
