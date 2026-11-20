package academia.bff.web;

import academia.bff.Servicios;
import java.util.Map;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** BFF de la web (puerto 8092): la ficha completa con reseñas, para una pantalla grande. */
@SpringBootApplication
@Import(Servicios.class)
@RestController
public class BffWebApp {

    public record FichaProducto(Map<String, Object> producto, Map<String, Object> inventario,
                                Map<String, Object> resenas) {}

    private final Servicios servicios;

    BffWebApp(Servicios servicios) {
        this.servicios = servicios;
    }

    @GetMapping("/web/productos/{id}")
    FichaProducto ficha(@PathVariable long id) {
        var producto = servicios.producto(id);                      // tres llamadas en paralelo
        var stock = servicios.stock(id);
        var resenas = servicios.resenas(id);
        return new FichaProducto(producto.join(), stock.join(), resenas.join());
    }

    public static ConfigurableApplicationContext arrancar(String... args) {
        return new SpringApplicationBuilder(BffWebApp.class).properties("server.port=8092").run(args);
    }

    public static void main(String[] args) {
        arrancar(args);
    }
}
