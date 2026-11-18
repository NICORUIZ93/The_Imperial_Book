package academia.rutaflow.security;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@TestConfiguration
@Profile("test")
class MockJwtConfiguration {
    @Bean
    JwtDecoder jwtDecoder() {
        return token -> {
            String subject = switch (token) {
                case "ana" -> "ana";
                case "luis" -> "luis";
                default -> throw new IllegalArgumentException("Token de prueba desconocido");
            };
            List<String> roles = "ana".equals(subject) ? List.of("location:write") : List.of();
            return Jwt.withTokenValue(token)
                .header("alg", "none")
                .claim("sub", subject)
                .claim("realm_access", Map.of("roles", roles))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();
        };
    }
}
