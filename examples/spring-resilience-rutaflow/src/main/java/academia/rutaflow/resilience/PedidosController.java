package academia.rutaflow.resilience;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PedidosController {
    private final PedidosClient pedidosClient;

    public PedidosController(PedidosClient pedidosClient) {
        this.pedidosClient = pedidosClient;
    }

    @GetMapping("/api/pedidos/1")
    ResponseEntity<String> pedido() {
        try {
            return ResponseEntity.ok(pedidosClient.consultarPedido());
        } catch (CallNotPermittedException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Circuito abierto: servicio-pedidos protegido");
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Error al consultar servicio-pedidos");
        }
    }
}
