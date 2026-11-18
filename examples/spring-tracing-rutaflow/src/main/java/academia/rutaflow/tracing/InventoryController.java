package academia.rutaflow.tracing;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty(name = "rutaflow.role", havingValue = "inventory")
public class InventoryController {
    @GetMapping("/inventory/{pedidoId}")
    InventoryResponse reserve(@PathVariable String pedidoId) {
        return new InventoryResponse("Inventario reservado para " + pedidoId);
    }

    record InventoryResponse(String message) {}
}
