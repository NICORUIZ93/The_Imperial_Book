package academia.resiliencia;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Cliente del inventario. Cada método muestra un patrón; la configuración de cada uno está en
 * application.yml bajo resilience4j.*.instances.inventario.
 */
@Component
public class InventarioCliente {

    private final RestClient rest;
    private final ExecutorService hilos = Executors.newVirtualThreadPerTaskExecutor();

    InventarioCliente(RestClient.Builder builder, @Value("${inventario.url}") String url) {
        // Timeouts de red SIEMPRE: sin ellos, ningún patrón te salva de una conexión colgada.
        var fabrica = new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(Duration.ofMillis(500)).build());
        fabrica.setReadTimeout(Duration.ofSeconds(3));
        this.rest = builder.baseUrl(url).requestFactory(fabrica).build();
    }

    private Stock pedir(String sku) {
        return rest.get().uri("/stock/{sku}", sku).retrieve().body(Stock.class);
    }

    /**
     * Retry (por fuera) + CircuitBreaker (por dentro): orden por defecto de Resilience4j,
     * Retry(CircuitBreaker(RateLimiter(TimeLimiter(Bulkhead(llamada))))).
     * El fallback va en @Retry, el aspecto exterior: si lo pusieras en @CircuitBreaker,
     * el Retry vería siempre "éxito" y nunca reintentaría.
     */
    @Retry(name = "inventario", fallbackMethod = "stockDesconocido")
    @CircuitBreaker(name = "inventario")
    public Stock consultar(String sku) {
        return pedir(sku);
    }

    Stock stockDesconocido(String sku, Throwable causa) {
        return new Stock(sku, null, "fallback: " + causa.getClass().getSimpleName());
    }

    /** RateLimiter: como mucho 3 llamadas por segundo al inventario; la 4.ª recibe RequestNotPermitted. */
    @RateLimiter(name = "inventario")
    public Stock consultarConCuota(String sku) {
        return pedir(sku);
    }

    /** Bulkhead: como mucho 2 llamadas simultáneas; la 3.ª recibe BulkheadFullException al instante. */
    @Bulkhead(name = "inventario")
    public Stock consultarAislado(String sku) {
        return pedir(sku);
    }

    /** TimeLimiter: trabaja sobre CompletableFuture; a los 500 ms completa con TimeoutException y cancela. */
    @TimeLimiter(name = "inventario")
    public CompletableFuture<Stock> consultarConLimite(String sku) {
        return CompletableFuture.supplyAsync(() -> pedir(sku), hilos);
    }
}
