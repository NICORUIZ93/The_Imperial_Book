package academia.seguridad.rbac;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/** Los mismos 4 tokens de la tabla de jdk/RbacScopes.java, con la forma de los de Keycloak. */
@TestConfiguration
class TokensDePrueba {

    record Datos(String rol, String scope) { }

    static final Map<String, Datos> TOKENS = Map.of(
        "ana-web", new Datos("cliente", "pedidos:leer pedidos:crear"),
        "ana-widget", new Datos("cliente", "pedidos:leer"),
        "sofia", new Datos("soporte", "pedidos:leer pedidos:reembolsar pedidos:borrar"),
        "root", new Datos("admin", "pedidos:leer pedidos:crear pedidos:reembolsar pedidos:borrar"));

    @Bean
    JwtDecoder jwtDecoder() {
        return token -> {
            Datos d = TOKENS.get(token);
            if (d == null) throw new BadJwtException("token de prueba desconocido");
            return Jwt.withTokenValue(token).header("alg", "RS256")
                .subject(token).audience(List.of("pedidos"))
                .claim("scope", d.scope())
                .claim("realm_access", Map.of("roles", List.of(d.rol())))
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300))
                .build();
        };
    }
}
