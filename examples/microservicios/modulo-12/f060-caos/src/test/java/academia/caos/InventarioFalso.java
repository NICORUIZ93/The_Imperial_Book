package academia.caos;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/** "inventario" de juguete para los tests, con fallos controlables: latencia, N errores 503 o caído. */
public final class InventarioFalso implements AutoCloseable {

    public final AtomicInteger atendidas = new AtomicInteger();
    public final AtomicInteger fallarProximas = new AtomicInteger();
    public volatile boolean siempreFalla;
    public volatile long latenciaMs;
    private final HttpServer servidor;

    public InventarioFalso() throws IOException {
        servidor = HttpServer.create(new InetSocketAddress("0.0.0.0", 0), 0);
        servidor.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        servidor.createContext("/stock/", ex -> {
            atendidas.incrementAndGet();
            try { Thread.sleep(latenciaMs); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            boolean falla = siempreFalla || fallarProximas.getAndUpdate(n -> Math.max(0, n - 1)) > 0;
            String sku = ex.getRequestURI().getPath().substring("/stock/".length());
            byte[] b = (falla ? "{\"error\":\"NO_DISPONIBLE\"}" : "{\"sku\":\"" + sku + "\",\"stock\":12}")
                .getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(falla ? 503 : 200, b.length);
            ex.getResponseBody().write(b);
            ex.close();
        });
        servidor.start();
    }

    public int puerto() { return servidor.getAddress().getPort(); }
    public String url() { return "http://127.0.0.1:" + puerto(); }

    public void reiniciar() {
        atendidas.set(0); fallarProximas.set(0); siempreFalla = false; latenciaMs = 0;
    }

    @Override
    public void close() { servidor.stop(0); }
}
