package academia.rutaflow.security;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RutaflowApiController {
    private final PedidoOwnership pedidoOwnership;

    public RutaflowApiController(PedidoOwnership pedidoOwnership) {
        this.pedidoOwnership = pedidoOwnership;
    }

    @GetMapping("/api/pedidos/{id}")
    ResponseEntity<String> pedido(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        pedidoOwnership.requireOwner(jwt.getSubject(), id);
        return ResponseEntity.ok("Pedido " + id + " para " + jwt.getSubject());
    }

    @PostMapping("/api/ubicaciones/{id}")
    ResponseEntity<String> guardarUbicacion(@PathVariable String id) {
        return ResponseEntity.ok("Ubicación " + id + " guardada");
    }
}
