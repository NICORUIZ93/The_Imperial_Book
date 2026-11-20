package academia.balanceo;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;

/** Servicio HTTP de juguete para los tests: responde con lo que diga la función, tras una latencia. */
final class Backend implements AutoCloseable {

    private final HttpServer servidor;

    Backend(long latenciaMs, Function<String, String> respuesta) throws IOException {
        servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        servidor.setExecutor(java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor());
        servidor.createContext("/", ex -> {
            try { Thread.sleep(latenciaMs); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            String ruta = ex.getRequestURI().getPath();
            String id = ex.getRequestHeaders().getFirst("X-Request-Id");
            byte[] cuerpo = respuesta.apply(ruta + "|" + id).getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, cuerpo.length);
            ex.getResponseBody().write(cuerpo);
            ex.close();
        });
        servidor.start();
    }

    String url() {
        return "http://127.0.0.1:" + servidor.getAddress().getPort();
    }

    void apagar() {
        servidor.stop(0);
    }

    @Override
    public void close() {
        apagar();
    }
}
