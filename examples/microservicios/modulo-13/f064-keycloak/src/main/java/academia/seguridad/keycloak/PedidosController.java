package academia.seguridad.keycloak;

import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PedidosController {

    @GetMapping("/pedidos")
    Map<String, Object> pedidos(Principal quien) {
        return Map.of("usuario", quien.getName(), "pedidos", 3);
    }

    @GetMapping("/admin/reportes")
    Map<String, Object> reportes() {
        return Map.of("ventas", 42);
    }
}
