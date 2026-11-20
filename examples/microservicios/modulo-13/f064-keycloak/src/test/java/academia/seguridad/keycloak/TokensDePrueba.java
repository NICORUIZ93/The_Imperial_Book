package academia.seguridad.keycloak;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Sustituye al decoder real (que consultaría Keycloak) por uno que traduce tokens de prueba
 * con la MISMA forma que los de Keycloak. Así el test recorre la cadena real, incluido RolesDeKeycloak.
 */
@TestConfiguration
class TokensDePrueba {

    @Bean
    JwtDecoder jwtDecoder() {
        return token -> {
            List<String> roles = switch (token) {
                case "token-ana" -> List.of("cliente");
                case "token-root" -> List.of("admin");
                case "token-sin-roles" -> List.of();
                default -> throw new BadJwtException("token de prueba desconocido");
            };
            return Jwt.withTokenValue(token)
                .header("alg", "RS256")
                .issuer("http://localhost:8180/realms/tienda")
                .subject("4f1c-uuid-" + token)
                .audience(List.of("pedidos"))
                .claim("preferred_username", token.replace("token-", ""))
                .claim("realm_access", Map.of("roles", roles))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();
        };
    }
}
