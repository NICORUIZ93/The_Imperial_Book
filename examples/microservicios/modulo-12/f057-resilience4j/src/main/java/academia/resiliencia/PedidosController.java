package academia.resiliencia;

import io.github.resilience4j.bulkhead.BulkheadFullException;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeoutException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PedidosController {

    private final InventarioCliente inventario;

    PedidosController(InventarioCliente inventario) {
        this.inventario = inventario;
    }

    @GetMapping("/pedidos/stock/{sku}")
    Stock stock(@PathVariable String sku) { return inventario.consultar(sku); }

    @GetMapping("/pedidos/cuota/{sku}")
    Stock cuota(@PathVariable String sku) { return inventario.consultarConCuota(sku); }

    @GetMapping("/pedidos/aislado/{sku}")
    Stock aislado(@PathVariable String sku) { return inventario.consultarAislado(sku); }

    @GetMapping("/pedidos/limite/{sku}")
    CompletableFuture<Stock> limite(@PathVariable String sku) { return inventario.consultarConLimite(sku); }

    // Cada rechazo de un patrón se traduce a un código HTTP que el cliente sabe interpretar.
    @ExceptionHandler(RequestNotPermitted.class)
    ResponseEntity<Map<String, String>> cuota(RequestNotPermitted e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", "1")
            .body(Map.of("error", "CUOTA_AGOTADA"));
    }

    @ExceptionHandler(BulkheadFullException.class)
    ResponseEntity<Map<String, String>> lleno(BulkheadFullException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "COMPARTIMENTO_LLENO"));
    }

    @ExceptionHandler(TimeoutException.class)
    ResponseEntity<Map<String, String>> tiempo(TimeoutException e) {
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(Map.of("error", "INVENTARIO_LENTO"));
    }
}
