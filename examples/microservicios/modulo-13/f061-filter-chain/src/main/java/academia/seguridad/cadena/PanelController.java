package academia.seguridad.cadena;

import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PanelController {

    @GetMapping("/publico/hola")
    Map<String, String> hola() { return Map.of("mensaje", "hola, visitante"); }

    @GetMapping("/yo")
    Map<String, String> yo(Principal quien) { return Map.of("usuario", quien.getName()); }

    @GetMapping("/admin/panel")
    Map<String, String> panel() { return Map.of("panel", "ventas del día: 42"); }
}
