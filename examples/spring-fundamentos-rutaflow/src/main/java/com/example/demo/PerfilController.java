package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PerfilController {
    private final String banner;
    private final String entorno;

    public PerfilController(
            @Value("${academia.banner:sin-configurar}") String banner,
            @Value("${academia.entorno:sin-configurar}") String entorno) {
        this.banner = banner;
        this.entorno = entorno;
    }

    @GetMapping("/perfil")
    public String mostrar() {
        return "banner=" + banner + "; entorno=" + entorno;
    }
}
