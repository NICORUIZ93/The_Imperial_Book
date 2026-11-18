package academia.rutaflow.probes;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EstadoEntregaController {
    @GetMapping("/entrega")
    public Entrega estado() {
        return new Entrega("RF-314", "en camino");
    }

    record Entrega(String codigo, String estado) {}
}
