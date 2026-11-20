package academia.seguridad.rbac;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pedidos")
class PedidosController {

    @GetMapping
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:leer')")
    Map<String, Object> listar() { return Map.of("pedidos", 3); }

    @PostMapping
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:crear')")
    ResponseEntity<Void> crear() { return ResponseEntity.status(201).build(); }

    @PostMapping("/{id}/reembolso")
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:reembolsar')")
    Map<String, Object> reembolsar(@PathVariable long id) { return Map.of("pedido", id, "reembolsado", true); }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:borrar')")
    ResponseEntity<Void> borrar(@PathVariable long id) { return ResponseEntity.noContent().build(); }
}
