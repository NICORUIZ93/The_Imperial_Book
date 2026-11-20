package academia.seguridad.oidc;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CuentaController {

    @GetMapping("/")
    Map<String, String> inicio() { return Map.of("mensaje", "tienda: entra en /yo para iniciar sesión"); }

    /** OIDC: quién inició sesión sale del id_token ya validado (firma, aud, exp, nonce; iss con el perfil keycloak). */
    @GetMapping("/yo")
    Map<String, Object> yo(@AuthenticationPrincipal OidcUser usuario) {
        return Map.of(
            "sub", usuario.getSubject(),
            "usuario", usuario.getPreferredUsername(),
            "emisor", usuario.getIssuer().toString());
    }
}
