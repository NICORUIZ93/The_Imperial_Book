package academia.seguridad.cadena;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro propio que se inserta DESPUÉS de BasicAuthenticationFilter y ANTES de AuthorizationFilter:
 * ya sabe quién llama, pero aún no se decidió si puede pasar. No es un @Component a propósito:
 * si lo fuera, Spring Boot también lo registraría en Tomcat y se ejecutaría dos veces.
 */
class AuditoriaFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        String quien = a == null ? "anonimo" : a.getName();   // el AnonymousAuthenticationFilter ya puso "anonymousUser"
        log.info("auditoría: {} {} por {}", req.getMethod(), req.getRequestURI(), quien);
        res.setHeader("X-Auditado-Por", quien);
        chain.doFilter(req, res);
    }
}
