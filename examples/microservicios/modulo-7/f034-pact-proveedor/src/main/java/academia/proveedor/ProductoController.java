package academia.proveedor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductoController {

    private final Productos productos;

    ProductoController(Productos productos) {
        this.productos = productos;
    }

    @GetMapping("/productos/{id}")
    ResponseEntity<Producto> obtener(@PathVariable long id) {
        return ResponseEntity.of(productos.buscar(id));
    }
}
