package academia.fallbacks;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class StockController {

    private final InventarioServicio inventario;

    StockController(InventarioServicio inventario) {
        this.inventario = inventario;
    }

    @GetMapping("/productos/{sku}/stock")
    Stock stock(@PathVariable String sku) {
        return inventario.consultar(sku);
    }

    @PostMapping("/productos/{sku}/reservas")
    ResponseEntity<Map<String, Object>> reservar(@PathVariable String sku, @RequestParam int unidades) {
        inventario.reservar(sku, unidades);
        return ResponseEntity.ok(Map.of("sku", sku, "reservadas", unidades));
    }

    /** Fallar rápido y claro: 503 con cuándo reintentar, nunca un "reservado" inventado. */
    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<Map<String, Object>> noDisponible(RuntimeException e) {
        return ResponseEntity.status(503).header("Retry-After", "30")
            .body(Map.of("error", "INVENTARIO_NO_DISPONIBLE", "causa", e.getClass().getSimpleName()));
    }
}
