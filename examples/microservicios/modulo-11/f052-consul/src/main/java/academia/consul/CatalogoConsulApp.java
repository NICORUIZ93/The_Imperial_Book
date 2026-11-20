package academia.consul;

import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** El mismo servicio "catalogo", ahora registrado en Consul. El código no cambia: solo la dependencia. */
@SpringBootApplication
@RestController
public class CatalogoConsulApp {

    private final DiscoveryClient discovery;

    CatalogoConsulApp(DiscoveryClient discovery) {
        this.discovery = discovery;
    }

    @GetMapping("/instancias/{servicio}")
    List<String> instancias(@PathVariable String servicio) {
        return discovery.getInstances(servicio).stream().map(i -> i.getInstanceId() + " -> " + i.getUri()).toList();
    }

    public static void main(String[] args) {
        SpringApplication.run(CatalogoConsulApp.class, args);
    }
}
