// F057 · Los 5 patrones de Resilience4j por dentro, contra fallos inyectados (solo JDK 25).
// Ejecuta: java Patrones.java   (usa Inventario.java y ProxyDeFallos.java de esta carpeta)
// Cada patrón está escrito en pocas líneas para que veas su mecánica; en el servicio real usas
// Resilience4j 2.4.0 (f057-resilience4j), que hace lo mismo con configuración y métricas.
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Patrones {


    static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(500)).build();
    static ProxyDeFallos proxy;
    static long t0;
    static int fallos = 0;

    public static void main(String[] args) throws Exception {
        var inventario = Inventario.arrancar("127.0.0.1", 0);
        proxy = new ProxyDeFallos(inventario.getAddress().getPort());
        llamar();                                                    // calentamiento de la JVM

        timeLimiter();
        retry();
        circuitBreaker();
        bulkhead();
        rateLimiter();

        proxy.close();
        inventario.stop(0);
        System.out.println(fallos == 0 ? "OK: los 5 patrones se comportaron como se esperaba" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }

    /** La llamada protegida: GET /stock/7 a través del proxy de fallos. */
    static String llamar() throws Exception {
        HttpResponse<String> r = HTTP.send(HttpRequest.newBuilder(URI.create(proxy.url() + "/stock/7")).build(),
                                           HttpResponse.BodyHandlers.ofString());
        if (r.statusCode() >= 500) throw new ErrorDelServidor(r.statusCode());
        return r.body();
    }

    // ---------------------------------------------------------------- TimeLimiter
    static void timeLimiter() throws Exception {
        System.out.println("== TimeLimiter (límite 500 ms) · fallo inyectado: latencia 2000 ms");
        proxy.latencia(2000);
        inicio();
        // Como cancelRunningFuture=true de Resilience4j: al vencer el límite se CANCELA la petición.
        // Si no la cancelas, sigue viva en segundo plano ocupando una conexión (y el JDK puede
        // reenviarla cuando el proxy la corte: una petición huérfana que nadie espera).
        CompletableFuture<HttpResponse<String>> enCurso = HTTP.sendAsync(
            HttpRequest.newBuilder(URI.create(proxy.url() + "/stock/7")).build(), HttpResponse.BodyHandlers.ofString());
        String resultado;
        try {
            resultado = enCurso.get(500, TimeUnit.MILLISECONDS).body();
        } catch (TimeoutException e) {
            enCurso.cancel(true);
            resultado = "TimeoutException";
        }
        System.out.printf("   resultado=%s tras %d ms (sin límite habrías esperado 2000 ms)%n", resultado, ms());
        comprobar(resultado.equals("TimeoutException") && ms() < 700);
        proxy.restablecer();
    }

    // ---------------------------------------------------------------- Retry
    static void retry() throws Exception {
        System.out.println("== Retry (3 intentos, espera 100 ms x2 + jitter) · fallo inyectado: 2 respuestas 503 seguidas");
        Inventario.FALLAR_PROXIMAS.set(2);
        int antes = Inventario.ATENDIDAS.get();
        Random jitter = new Random(1);
        String resultado = null;
        long espera = 100;
        for (int intento = 1; intento <= 3 && resultado == null; intento++) {
            try {
                resultado = llamar();
                System.out.println("   intento " + intento + ": OK " + resultado);
            } catch (Exception e) {
                System.out.println("   intento " + intento + ": " + e.getClass().getSimpleName() + " " + e.getMessage());
                if (intento < 3) {
                    Thread.sleep(espera + jitter.nextLong(espera / 2));   // backoff exponencial con jitter
                    espera *= 2;
                }
            }
        }
        comprobar(resultado != null && Inventario.ATENDIDAS.get() - antes == 3);
        proxy.restablecer();
    }

    // ---------------------------------------------------------------- CircuitBreaker
    enum Estado { CLOSED, OPEN, HALF_OPEN }

    static Estado estado = Estado.CLOSED;
    static final List<Boolean> ventana = new ArrayList<>();          // últimas 4 llamadas: true = falló
    static long abiertoDesde;
    static int pruebasEnHalfOpen;

    /** Ventana de 4 llamadas, umbral 50 %, 1 s abierto, 2 llamadas de prueba en HALF_OPEN. */
    static String conCircuitBreaker() throws Exception {
        if (estado == Estado.OPEN) {
            if (System.currentTimeMillis() - abiertoDesde < 1000) throw new IllegalStateException("CallNotPermitted");
            estado = Estado.HALF_OPEN;
            pruebasEnHalfOpen = 0;
            System.out.println("   -> el circuito pasa a HALF_OPEN");
        }
        try {
            String r = llamar();
            registrar(false);
            return r;
        } catch (Exception e) {
            registrar(true);
            throw e;
        }
    }

    static void registrar(boolean fallo) {
        if (estado == Estado.HALF_OPEN) {
            if (fallo) { abrir(); return; }
            if (++pruebasEnHalfOpen == 2) { estado = Estado.CLOSED; ventana.clear(); System.out.println("   -> el circuito pasa a CLOSED"); }
            return;
        }
        ventana.add(fallo);
        if (ventana.size() > 4) ventana.removeFirst();
        long fallidas = ventana.stream().filter(f -> f).count();
        if (ventana.size() == 4 && fallidas * 100 / 4 >= 50) abrir();
    }

    static void abrir() {
        estado = Estado.OPEN;
        abiertoDesde = System.currentTimeMillis();
        ventana.clear();
        System.out.println("   -> el circuito pasa a OPEN");
    }

    static void circuitBreaker() throws Exception {
        System.out.println("== CircuitBreaker · fallo inyectado: inventario caído (puerto cerrado)");
        proxy.caer();
        int antes = Inventario.ATENDIDAS.get();
        List<String> rechazos = new ArrayList<>();
        for (int i = 1; i <= 7; i++) {
            inicio();
            String r;
            try {
                r = "OK " + conCircuitBreaker();
            } catch (Exception e) {
                r = e.getClass().getSimpleName() + ("CallNotPermitted".equals(e.getMessage()) ? ": CallNotPermitted" : "");
                if (r.contains("CallNotPermitted")) rechazos.add(r);
            }
            System.out.printf("   llamada %d [%s] %s (%d ms)%n", i, estado, r, ms());
        }
        System.out.println("   ...el inventario vuelve; esperamos 1 s");
        proxy.levantar();
        Thread.sleep(1100);
        for (int i = 8; i <= 9; i++) {
            String r = "OK " + conCircuitBreaker();
            System.out.printf("   llamada %d [%s] %s%n", i, estado, r);
        }
        comprobar(rechazos.size() == 3 && estado == Estado.CLOSED && Inventario.ATENDIDAS.get() - antes == 2);
    }

    // ---------------------------------------------------------------- Bulkhead
    static void bulkhead() throws Exception {
        System.out.println("== Bulkhead (2 llamadas concurrentes, espera máxima 0) · fallo inyectado: latencia 800 ms");
        proxy.latencia(800);
        Semaphore compartimento = new Semaphore(2);
        var hilos = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor();
        List<CompletableFuture<String>> llamadas = new ArrayList<>();
        inicio();
        for (int i = 1; i <= 5; i++) {
            llamadas.add(CompletableFuture.supplyAsync(() -> {
                if (!compartimento.tryAcquire()) return "BulkheadFull";      // rechazo inmediato
                try {
                    llamarSinExcepciones();
                    return "OK";
                } finally {
                    compartimento.release();                                // libera al terminar
                }
            }, hilos));
            Thread.sleep(20);
        }
        List<String> resultados = llamadas.stream().map(CompletableFuture::join).toList();
        System.out.printf("   resultados=%s en %d ms: 3 rechazadas al instante, el resto del servicio sigue libre%n",
                          resultados, ms());
        comprobar(resultados.stream().filter("OK"::equals).count() == 2);
        proxy.restablecer();
    }

    // ---------------------------------------------------------------- RateLimiter
    static void rateLimiter() throws Exception {
        System.out.println("== RateLimiter (3 llamadas por periodo de 1 s, espera máxima 0) · 5 llamadas seguidas");
        int permisos = 3;
        long periodo = System.currentTimeMillis();
        List<String> resultados = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            if (System.currentTimeMillis() - periodo >= 1000) { periodo = System.currentTimeMillis(); permisos = 3; }
            if (permisos > 0) { permisos--; llamar(); resultados.add("OK"); }
            else resultados.add("RequestNotPermitted");
        }
        System.out.println("   resultados=" + resultados);
        comprobar(resultados.equals(List.of("OK", "OK", "OK", "RequestNotPermitted", "RequestNotPermitted")));
    }

    static class ErrorDelServidor extends Exception {
        ErrorDelServidor(int estado) { super("HTTP " + estado); }
    }

    static String llamarSinExcepciones() {
        try { return llamar(); } catch (Exception e) { return e.getClass().getSimpleName(); }
    }

    static void inicio() { t0 = System.nanoTime(); }
    static long ms() { return (System.nanoTime() - t0) / 1_000_000; }
    static void comprobar(boolean ok) { if (!ok) { fallos++; System.out.println("   FALLA en este patrón"); } }
}
