package com.example.demo;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuariosController {
    @GetMapping("/api/usuarios")
    public Map<String, String> usuarioActual(Authentication authentication) {
        String rol = authentication.getAuthorities().iterator().next().getAuthority();
        return Map.of("email", authentication.getName(), "rol", rol);
    }
}
