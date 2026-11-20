package academia.seguridad.jwt;

import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class JwtConfig {

    static final String EMISOR = "https://auth.tienda.local";
    static final String AUDIENCIA = "pedidos";

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(r -> r.anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))   // usa el JwtDecoder de abajo
            .build();
    }

    /** Valida exp/nbf (por defecto), el emisor y que el token sea PARA este servicio. */
    static OAuth2TokenValidator<Jwt> validadores() {
        return new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(EMISOR),
            new JwtClaimValidator<List<String>>("aud", aud -> aud != null && aud.contains(AUDIENCIA)));
    }

    /** RS256 (asimétrica, por defecto): este servicio solo tiene la clave PÚBLICA; no puede emitir tokens. */
    @Bean
    @Profile("!hs256")
    JwtDecoder decoderRs256(@Value("${tienda.jwt.clave-publica}") RSAPublicKey publica) {
        NimbusJwtDecoder d = NimbusJwtDecoder.withPublicKey(publica)
            .signatureAlgorithm(SignatureAlgorithm.RS256)                 // alg fijo: "none" y HS256 se rechazan
            .build();
        d.setJwtValidator(validadores());
        return d;
    }

    /** HS256 (simétrica, perfil hs256): el MISMO secreto verifica y también podría emitir tokens. */
    @Bean
    @Profile("hs256")
    JwtDecoder decoderHs256(@Value("${tienda.jwt.secreto}") String secreto) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("tienda.jwt.secreto debe tener al menos 32 bytes para HS256 (tiene " + bytes.length + ")");
        }
        SecretKey clave = new SecretKeySpec(bytes, "HmacSHA256");
        NimbusJwtDecoder d = NimbusJwtDecoder.withSecretKey(clave).macAlgorithm(MacAlgorithm.HS256).build();
        d.setJwtValidator(validadores());
        return d;
    }
}
