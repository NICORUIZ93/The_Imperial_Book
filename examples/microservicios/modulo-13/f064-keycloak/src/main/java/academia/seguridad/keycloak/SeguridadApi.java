package academia.seguridad.keycloak;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SeguridadApi {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        var conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(new RolesDeKeycloak());
        conversor.setPrincipalClaimName("preferred_username");      // getName() = "ana" en vez del UUID de sub
        return http
            .authorizeHttpRequests(r -> r
                .requestMatchers("/admin/**").hasRole("admin")
                .requestMatchers("/pedidos/**").hasAnyRole("cliente", "soporte", "admin")
                .anyRequest().denyAll())                                // lo no declarado, cerrado
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(conversor)))
            .build();
    }
}
