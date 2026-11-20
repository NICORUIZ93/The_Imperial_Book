package academia.errores;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductoController {

    record CrearProducto(@NotBlank String sku, @Positive BigDecimal precio) { }

    private final Map<String, BigDecimal> precios = Map.of("CAF-1", new BigDecimal("32000"));

    // Los controladores quedan limpios: lanzan y se olvidan; nada de try/catch aquí.
    @GetMapping("/productos/{sku}")
    Map<String, Object> buscar(@PathVariable String sku) {
        BigDecimal precio = precios.get(sku);
        if (precio == null) {
            throw new ProductoNoEncontradoException(sku);
        }
        return Map.of("sku", sku, "precio", precio);
    }

    @PostMapping("/productos")
    Map<String, Object> crear(@Valid @RequestBody CrearProducto datos) {
        return Map.of("sku", datos.sku(), "precio", datos.precio());
    }

    @GetMapping("/productos/{sku}/fallo")
    Map<String, Object> fallar(@PathVariable String sku) {
        throw new IllegalStateException("password=postgres; host=10.0.0.12");  // detalle interno
    }
}
