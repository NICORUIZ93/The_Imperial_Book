package academia.catalogo;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CatalogoController {

    record Producto(String sku, String nombre, int precio) {
    }

    record Info(String version, String color, String mensaje, String pod, boolean claveApiConfigurada) {
    }

    private final CatalogoProperties props;

    CatalogoController(CatalogoProperties props) {
        this.props = props;
    }

    @GetMapping("/api/productos")
    List<Producto> productos() {
        return List.of(new Producto("A-1", "Teclado", 100), new Producto("A-2", "Ratón", 40));
    }

    /** Qué versión responde y desde qué pod: con esto se ven los Blue-Green, los Canary y los rollouts. */
    @GetMapping("/api/info")
    Info info() {
        String pod = System.getenv().getOrDefault("HOSTNAME", "local");
        boolean conClave = props.claveApi() != null && !props.claveApi().isBlank();
        // Nunca devuelvas el secreto: solo si está configurado.
        return new Info(props.version(), props.color(), props.mensaje(), pod, conClave);
    }

    /** Quema CPU durante «ms» milisegundos: genera la carga que hace escalar al HPA. */
    @GetMapping("/api/cpu")
    Map<String, Object> cpu(@RequestParam(defaultValue = "100") long ms) {
        long fin = System.nanoTime() + Math.min(ms, 2000) * 1_000_000;
        double x = 0;
        while (System.nanoTime() < fin) {
            x += Math.sqrt(x + 1);
        }
        return Map.of("ms", ms, "resultado", (long) x % 10);
    }
}
