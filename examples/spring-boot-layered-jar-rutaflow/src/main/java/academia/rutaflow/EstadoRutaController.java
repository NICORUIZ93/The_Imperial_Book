package academia.rutaflow;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EstadoRutaController {
    @GetMapping("/ruta")
    public EstadoRuta consultar() {
        return new EstadoRuta("RF-314", "en camino");
    }

    record EstadoRuta(String codigo, String estado) {}
}
