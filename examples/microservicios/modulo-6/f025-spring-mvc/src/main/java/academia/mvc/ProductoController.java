package academia.mvc;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * El DispatcherServlet recibe TODAS las peticiones y, según método + ruta,
 * elige uno de estos métodos (handler). Jackson convierte JSON <-> records.
 */
@RestController
@RequestMapping("/productos")
class ProductoController {

    private final Catalogo catalogo;

    ProductoController(Catalogo catalogo) { this.catalogo = catalogo; }

    @PostMapping
    ResponseEntity<Producto> crear(@Valid @RequestBody CrearProducto datos) {
        Producto creado = catalogo.crear(datos);
        return ResponseEntity.created(URI.create("/productos/" + creado.id())).body(creado);
    }

    @GetMapping("/{id}")
    Producto buscar(@PathVariable long id) {
        return catalogo.buscar(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe el producto " + id));
    }

    @GetMapping
    List<Producto> listar() { return catalogo.todos(); }
}
