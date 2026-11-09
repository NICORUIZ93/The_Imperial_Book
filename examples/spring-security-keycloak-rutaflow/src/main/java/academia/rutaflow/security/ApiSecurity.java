package academia.rutaflow.security;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.core.convert.converter.Converter;

@Configuration
public class ApiSecurity {
    @Bean
    SecurityFilterChain api(HttpSecurity http, JwtAuthenticationConverter jwtConverter) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/ubicaciones/**")
                    .hasAuthority("ROLE_location:write")
                .requestMatchers(HttpMethod.GET, "/api/pedidos/**").authenticated()
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)))
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of("http://localhost:4200"));
        cors.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cors.setAllowCredentials(false);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(realmRoleAuthorities());
        return converter;
    }

    private Converter<Jwt, Collection<GrantedAuthority>> realmRoleAuthorities() {
        return jwt -> {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            Object rawRoles = realmAccess == null ? null : realmAccess.get("roles");
            if (!(rawRoles instanceof Collection<?> roles)) {
                return List.of();
            }
            return roles.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        };
    }
}
