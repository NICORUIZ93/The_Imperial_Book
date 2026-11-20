package academia.fallbacks;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class InventarioServicio {

    record Guardado(Stock stock, long instante) {}
    /** Lo que responde el inventario: {"sku":"7","stock":12}. */
    record RespuestaInventario(String sku, Integer stock) {}

    private final RestClient rest;
    private final Map<String, Guardado> ultimoBueno = new ConcurrentHashMap<>();

    InventarioServicio(RestClient.Builder builder, @Value("${inventario.url}") String url) {
        var fabrica = new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build());
        fabrica.setReadTimeout(Duration.ofMillis(300));
        this.rest = builder.baseUrl(url).requestFactory(fabrica).build();
    }

    /** LECTURA no crítica: si falla, se responde con un dato marcado (caché o defecto). */
    @CircuitBreaker(name = "inventario", fallbackMethod = "respaldo")
    public Stock consultar(String sku) {
        RespuestaInventario r = rest.get().uri("/stock/{sku}", sku).retrieve().body(RespuestaInventario.class);
        Stock s = new Stock(r.sku(), r.stock(), "inventario", 0);
        ultimoBueno.put(sku, new Guardado(s, System.currentTimeMillis()));
        return s;
    }

    // Resilience4j elige el fallback cuyo tipo de excepción es el más cercano al error real.

    /** Circuito abierto: ni se intentó la llamada. */
    Stock respaldo(String sku, CallNotPermittedException e) {
        return desdeCache(sku, "cache (circuito abierto)");
    }

    /** Cualquier otro fallo (timeout, conexión rechazada, 5xx). */
    Stock respaldo(String sku, Exception e) {
        return desdeCache(sku, "cache");
    }

    private Stock desdeCache(String sku, String fuente) {
        Guardado g = ultimoBueno.get(sku);
        if (g == null) return new Stock(sku, null, "defecto", 0);       // nunca lo vimos: desconocido
        return g.stock().conFuente(fuente, System.currentTimeMillis() - g.instante());
    }

    /** ESCRITURA crítica: sin fallback. Si el inventario no responde, el error sube y el cliente lo ve. */
    @CircuitBreaker(name = "inventario")
    public void reservar(String sku, int unidades) {
        rest.post().uri("/stock/{sku}/reservas?unidades={u}", sku, unidades).retrieve().toBodilessEntity();
    }
}
