package academia.cache;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductoController {

    private final ProductoServicio servicio;

    ProductoController(ProductoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/productos/{id}")
    Producto buscar(@PathVariable long id) {
        return servicio.buscar(id);
    }

    @PutMapping("/productos/{id}/precio")
    void cambiarPrecio(@PathVariable long id, @RequestParam int valor) {
        servicio.cambiarPrecio(id, valor);
    }

    @GetMapping("/ofertas/hoy")
    Producto oferta() {
        return servicio.ofertaDelDia();
    }
}
