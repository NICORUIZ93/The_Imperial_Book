package academia.pruebas;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductoController {

    private final CatalogoServicio servicio;

    ProductoController(CatalogoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/productos/{id}/cotizacion")
    Cotizacion cotizar(@PathVariable long id, @RequestParam int cantidad) {
        return servicio.cotizar(id, cantidad);
    }
}
