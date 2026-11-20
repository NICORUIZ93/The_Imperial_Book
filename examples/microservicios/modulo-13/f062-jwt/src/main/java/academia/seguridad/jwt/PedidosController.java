package academia.seguridad.jwt;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PedidosController {

    /** Llega aquí solo si el filtro BearerTokenAuthenticationFilter validó el JWT. */
    @GetMapping("/pedidos/mios")
    Map<String, Object> mios(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("sub", jwt.getSubject(), "alg", jwt.getHeaders().get("alg"), "pedidos", 3);
    }
}
