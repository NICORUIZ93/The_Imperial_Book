package academia.seguridad.rbac;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity            // activa @PreAuthorize
class SeguridadRbac {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        var conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(new AutoridadesDelToken());
        return http
            .authorizeHttpRequests(r -> r.anyRequest().authenticated())   // grano grueso aquí, fino en @PreAuthorize
            .csrf(AbstractHttpConfigurer::disable)      // API sin cookies: el token va en la cabecera, no hay CSRF que explotar
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(conversor)))
            .build();
    }
}
