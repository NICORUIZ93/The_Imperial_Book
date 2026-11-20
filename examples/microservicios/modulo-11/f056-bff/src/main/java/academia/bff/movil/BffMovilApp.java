package academia.bff.movil;

import academia.bff.Servicios;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** BFF de la app móvil (puerto 8091): lo justo para una tarjeta de producto en una pantalla pequeña. */
@SpringBootApplication
@Import(Servicios.class)
@RestController
public class BffMovilApp {

    /** El contrato lo decide el equipo de la app móvil. */
    public record TarjetaProducto(long id, String nombre, long precio, int stock, String imagen) {}

    private final Servicios servicios;

    BffMovilApp(Servicios servicios) {
        this.servicios = servicios;
    }

    @GetMapping("/movil/productos/{id}")
    TarjetaProducto tarjeta(@PathVariable long id) {
        var producto = servicios.producto(id);                      // las dos llamadas salen a la vez
        var stock = servicios.stock(id);
        Map<String, Object> p = producto.join(), s = stock.join();
        List<?> imagenes = (List<?>) p.get("imagenes");
        return new TarjetaProducto(id, (String) p.get("nombre"), ((Number) p.get("precio")).longValue(),
                                   ((Number) s.get("stock")).intValue(), (String) imagenes.getFirst());
    }

    public static ConfigurableApplicationContext arrancar(String... args) {
        return new SpringApplicationBuilder(BffMovilApp.class).properties("server.port=8091").run(args);
    }

    public static void main(String[] args) {
        arrancar(args);
    }
}
