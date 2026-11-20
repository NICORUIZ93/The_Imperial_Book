package academia.discovery.catalogo;

import java.util.List;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Servicio "catalogo": se registra en Eureka al arrancar y consulta el registro. Config: catalogo.yml. */
@SpringBootApplication
@RestController
public class CatalogoApp {

    record Producto(long id, String nombre, long precio, String atendidoPor) {}

    private final DiscoveryClient discovery;
    private final String instancia;

    CatalogoApp(DiscoveryClient discovery, org.springframework.core.env.Environment env) {
        this.discovery = discovery;
        this.instancia = env.getProperty("eureka.instance.instance-id", "?");
    }

    @GetMapping("/productos/{id}")
    Producto producto(@PathVariable long id) {
        return new Producto(id, "Audífonos BT", 189_000, instancia);
    }

    /** Lo que el registro dice que existe de un servicio (lista local, refrescada cada 5 s). */
    @GetMapping("/instancias/{servicio}")
    List<String> instancias(@PathVariable String servicio) {
        return discovery.getInstances(servicio).stream()
            .map(i -> i.getInstanceId() + " -> " + i.getUri())
            .toList();
    }

    public static ConfigurableApplicationContext arrancar(String... args) {
        return new SpringApplicationBuilder(CatalogoApp.class)
            .properties("spring.config.name=catalogo")
            .run(args);
    }

    public static void main(String[] args) {
        arrancar(args);
    }
}
