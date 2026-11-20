package academia.bff;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Llamadas a los servicios de dominio. Cada llamada corre en su propio hilo virtual: en paralelo. */
@Component
public class Servicios {

    static final ParameterizedTypeReference<Map<String, Object>> JSON = new ParameterizedTypeReference<>() {};
    private final RestClient rest;
    private final ExecutorService hilos = Executors.newVirtualThreadPerTaskExecutor();
    private final String catalogo, inventario, resenas;

    Servicios(RestClient.Builder builder,
              @Value("${servicios.catalogo}") String catalogo,
              @Value("${servicios.inventario}") String inventario,
              @Value("${servicios.resenas}") String resenas) {
        this.rest = builder.build();
        this.catalogo = catalogo;
        this.inventario = inventario;
        this.resenas = resenas;
    }

    public CompletableFuture<Map<String, Object>> producto(long id) { return get(catalogo + "/productos/" + id); }
    public CompletableFuture<Map<String, Object>> stock(long id)    { return get(inventario + "/stock/" + id); }
    public CompletableFuture<Map<String, Object>> resenas(long id)  { return get(resenas + "/resenas/" + id); }

    private CompletableFuture<Map<String, Object>> get(String url) {
        return CompletableFuture.supplyAsync(() -> rest.get().uri(url).retrieve().body(JSON), hilos);
    }
}
