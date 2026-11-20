package academia.config.catalogo;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cliente: al arrancar pide su configuración al Config Server. Config local: catalogo.yml. */
@SpringBootApplication
@RestController
public class CatalogoConfigApp {

    /** @RefreshScope: el bean se vuelve a crear con los valores nuevos tras POST /actuator/refresh. */
    @Component
    @RefreshScope
    public static class Ajustes {
        @Value("${catalogo.pagina}") int pagina;
        @Value("${catalogo.banner:sin banner}") String banner;
        @Value("${tienda.moneda}") String moneda;

        public Map<String, Object> comoMapa() {
            return Map.of("pagina", pagina, "banner", banner, "moneda", moneda);
        }
    }

    private final Ajustes ajustes;

    CatalogoConfigApp(Ajustes ajustes) {
        this.ajustes = ajustes;
    }

    @GetMapping("/ajustes")
    Map<String, Object> ajustes() {
        return ajustes.comoMapa();
    }

    public static ConfigurableApplicationContext arrancar(String... args) {
        return new SpringApplicationBuilder(CatalogoConfigApp.class)
            .properties("spring.config.name=catalogo")
            .run(args);
    }

    public static void main(String[] args) {
        arrancar(args);
    }
}
