package academia.caos;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

/** BFF de producto (versión "v2" de la ficha): timeout de 200 ms al inventario + último valor bueno. */
@SpringBootApplication
@RestController
public class ProductoApp {

    private final RestClient inventario;
    private volatile String ultimoStock = "null";

    ProductoApp(RestClient.Builder builder, @Value("${inventario.url}") String url,
                @Value("${inventario.timeout:200ms}") Duration timeout) {
        var fabrica = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(timeout).build());
        fabrica.setReadTimeout(timeout);
        this.inventario = builder.baseUrl(url).requestFactory(fabrica).build();
    }

    @GetMapping("/productos/{id}")
    Map<String, Object> producto(@PathVariable long id) {
        try {
            String stock = inventario.get().uri("/stock/{id}", id).retrieve().body(String.class);
            ultimoStock = stock;
            return Map.of("id", id, "inventario", stock, "degradado", false);
        } catch (RuntimeException e) {
            return Map.of("id", id, "inventario", ultimoStock, "degradado", true);
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(ProductoApp.class, args);
    }
}
