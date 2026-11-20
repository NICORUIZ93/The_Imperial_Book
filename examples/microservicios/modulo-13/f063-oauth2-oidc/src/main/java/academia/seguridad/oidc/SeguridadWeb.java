package academia.seguridad.oidc;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SeguridadWeb {

    @Bean
    SecurityFilterChain web(HttpSecurity http, ClientRegistrationRepository registros) throws Exception {
        // PKCE explícito también para el cliente confidencial (con secreto): defensa en profundidad.
        var resolver = new DefaultOAuth2AuthorizationRequestResolver(registros, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());
        return http
            .authorizeHttpRequests(r -> r
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated())
            .oauth2Login(login -> login.authorizationEndpoint(e -> e.authorizationRequestResolver(resolver)))
            .build();
    }
}
