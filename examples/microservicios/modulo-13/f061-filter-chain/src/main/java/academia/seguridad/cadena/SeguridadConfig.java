package academia.seguridad.cadena;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;

@Configuration
class SeguridadConfig {

    /** DESPUÉS (seguro): reglas explícitas, la última niega por defecto a quien no se identificó. */
    @Bean
    @Profile("!antes")
    SecurityFilterChain cadenaSegura(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(reglas -> reglas
                .requestMatchers("/publico/**").permitAll()            // la primera regla que coincide gana
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults())                     // añade BasicAuthenticationFilter
            .addFilterBefore(new AuditoriaFilter(), AuthorizationFilter.class)
            .build();
    }

    /** ANTES (vulnerable): una cadena que deja pasar todo; existe solo para compararla (perfil "antes"). */
    @Bean
    @Profile("antes")
    SecurityFilterChain cadenaVulnerable(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(reglas -> reglas.anyRequest().permitAll())
            .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();   // {bcrypt} por defecto
    }

    @Bean
    UserDetailsService usuarios(PasswordEncoder encoder) {
        // Solo para el laboratorio: en producción los usuarios viven en Keycloak (F064) o en una base.
        return new InMemoryUserDetailsManager(
            User.withUsername("ana").password(encoder.encode("clave-ana")).roles("USER").build(),
            User.withUsername("root").password(encoder.encode("clave-root")).roles("USER", "ADMIN").build());
    }
}
