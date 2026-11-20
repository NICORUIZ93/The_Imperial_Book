// F058 · Timeouts en cascada y presupuesto de latencia (solo JDK 25).
// Ejecuta: java Presupuesto.java   (usa Inventario.java y ProxyDeFallos.java de esta carpeta)
// Cadena: cliente -> bff -> pedidos -> inventario (con 1500 ms de latencia inyectada).
// A) Timeouts "al revés" (cliente 1000 ms, bff 2000 ms, pedidos 3000 ms): el cliente se rinde y
//    los servicios siguen trabajando para nadie.
// B) Presupuesto propagado (cabecera X-Deadline, instante absoluto en ms): cada salto usa lo que
//    queda menos una reserva de 50 ms, pasa al siguiente un deadline 50 ms más corto y el cliente
//    recibe una respuesta degradada DENTRO de su presupuesto.
// C) Presupuesto agotado al llegar: el bff responde 504 sin llamar a nadie.
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.Executors;

public class Presupuesto {

    static final HttpClient HTTP = HttpClient.newBuilder().executor(Executors.newVirtualThreadPerTaskExecutor()).build();
    static final long RESERVA_MS = 50;           // lo que cada salto se guarda para responder
    static volatile boolean modoPresupuesto;     // false = escenario A, true = escenarios B y C
    static volatile long t0;
    static String urlInventario, urlPedidos;

    public static void main(String[] args) throws Exception {
        var inventario = Inventario.arrancar("127.0.0.1", 0);
        var proxy = new ProxyDeFallos(inventario.getAddress().getPort());
        urlInventario = proxy.url();
        HttpServer pedidos = servidor(Presupuesto::pedidos);
        urlPedidos = "http://127.0.0.1:" + pedidos.getAddress().getPort();
        HttpServer bff = servidor(Presupuesto::bff);
        String urlBff = "http://127.0.0.1:" + bff.getAddress().getPort();
        silencio = true;
        cliente(urlBff, null, 5000);                                  // calentamiento sin fallos
        silencio = false;
        proxy.latencia(1500);
        int fallos = 0;

        System.out.println("== A) Timeouts al revés: cliente 1000 ms < bff 2000 ms < pedidos 3000 ms");
        modoPresupuesto = false;
        String a = cliente(urlBff, null, 1000);
        Thread.sleep(800);                                            // deja que terminen los huérfanos
        if (!a.startsWith("timeout")) fallos++;

        System.out.println("== B) Presupuesto propagado: X-Deadline = ahora + 1000 ms");
        modoPresupuesto = true;
        String b = cliente(urlBff, System.currentTimeMillis() + 1000, 1000);
        Thread.sleep(800);
        if (!b.contains("200") || !b.contains("\"stock\":null")) fallos++;

        System.out.println("== C) Presupuesto agotado al llegar: X-Deadline = hace 10 ms");
        int antes = Inventario.ATENDIDAS.get();
        String c = cliente(urlBff, System.currentTimeMillis() - 10, 1000);
        if (!c.contains("504") || Inventario.ATENDIDAS.get() != antes) fallos++;
        System.out.println("   llamadas que llegaron al inventario: " + (Inventario.ATENDIDAS.get() - antes));

        bff.stop(0); pedidos.stop(0); proxy.close(); inventario.stop(0);
        System.out.println(fallos == 0 ? "OK: el presupuesto propagado mantiene la respuesta dentro del plazo" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }

    /** El cliente final: espera como máximo timeoutMs. */
    static String cliente(String urlBff, Long deadline, long timeoutMs) {
        t0 = System.nanoTime();
        HttpRequest.Builder req = HttpRequest.newBuilder(URI.create(urlBff + "/bff/pedidos/1"))
            .timeout(Duration.ofMillis(timeoutMs));
        if (deadline != null) req.header("X-Deadline", String.valueOf(deadline));
        String r;
        try {
            HttpResponse<String> resp = HTTP.send(req.build(), HttpResponse.BodyHandlers.ofString());
            r = resp.statusCode() + " " + resp.body();
        } catch (HttpTimeoutException e) {
            r = "timeout: el cliente se rindió";
        } catch (Exception e) {
            r = e.getClass().getSimpleName();
        }
        log("cliente ", r);
        return r;
    }

    /** BFF: llama a pedidos. Sin presupuesto usa 2000 ms fijos; con presupuesto, lo que queda. */
    static void bff(HttpExchange ex) throws IOException {
        String deadline = ex.getRequestHeaders().getFirst("X-Deadline");
        long timeout = 2000;
        if (modoPresupuesto) {
            timeout = Long.parseLong(deadline) - System.currentTimeMillis() - RESERVA_MS;
            if (timeout <= 0) {                                       // C) ni lo intentes
                responder(ex, 504, "{\"error\":\"SIN_PRESUPUESTO\"}", "bff     ");
                return;
            }
        }
        // Al siguiente salto le pasamos un deadline MÁS CORTO (menos nuestra reserva): así nos
        // contesta antes de que se nos acabe el tiempo a nosotros.
        String deadlineAbajo = modoPresupuesto ? String.valueOf(Long.parseLong(deadline) - RESERVA_MS) : null;
        Respuesta r = llamar(urlPedidos + "/pedidos/1", deadlineAbajo, timeout);
        if (r.estado == 200) responder(ex, 200, "{\"pedido\":1,\"detalle\":" + r.cuerpo + "}", "bff     ");
        // Degradación: el pedido se muestra, el stock queda como desconocido.
        else responder(ex, 200, "{\"pedido\":1,\"stock\":null,\"degradado\":true}", "bff     ");
    }

    /** Pedidos: llama al inventario. Sin presupuesto usa 3000 ms fijos; con presupuesto, lo que queda. */
    static void pedidos(HttpExchange ex) throws IOException {
        String deadline = ex.getRequestHeaders().getFirst("X-Deadline");
        long timeout = modoPresupuesto ? Long.parseLong(deadline) - System.currentTimeMillis() - RESERVA_MS : 3000;
        if (timeout <= 0) { responder(ex, 504, "{\"error\":\"SIN_PRESUPUESTO\"}", "pedidos "); return; }
        Respuesta r = llamar(urlInventario + "/stock/7", deadline, timeout);
        responder(ex, r.estado == 200 ? 200 : 504, r.estado == 200 ? r.cuerpo : "{\"error\":\"INVENTARIO_TIMEOUT\"}", "pedidos ");
    }

    record Respuesta(int estado, String cuerpo) {}

    static Respuesta llamar(String url, String deadline, long timeoutMs) {
        HttpRequest.Builder req = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofMillis(timeoutMs));
        if (deadline != null) req.header("X-Deadline", deadline);    // el MISMO deadline absoluto
        try {
            HttpResponse<String> r = HTTP.send(req.build(), HttpResponse.BodyHandlers.ofString());
            return new Respuesta(r.statusCode(), r.body());
        } catch (Exception e) {
            return new Respuesta(504, null);
        }
    }

    static void responder(HttpExchange ex, int estado, String cuerpo, String quien) throws IOException {
        log(quien, "responde " + estado);
        byte[] b = cuerpo.getBytes(StandardCharsets.UTF_8);
        try {
            ex.sendResponseHeaders(estado, b.length);
            ex.getResponseBody().write(b);
        } catch (IOException e) {
            log(quien, "nadie esperaba la respuesta (el que llamó ya se fue)");
        }
        ex.close();
    }

    static volatile boolean silencio;

    static void log(String quien, String que) {
        if (silencio) return;
        System.out.printf("   %5d ms  %s %s%n", (System.nanoTime() - t0) / 1_000_000, quien, que);
    }

    interface Manejador { void manejar(HttpExchange ex) throws IOException; }

    static HttpServer servidor(Manejador m) throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        s.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        s.createContext("/", m::manejar);
        s.start();
        return s;
    }
}
