package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ConfigController {
    private final String banner;

    public ConfigController(
            @Value("${academia.banner:sin-configurar}") String banner) {
        this.banner = banner;
    }

    @GetMapping("/banner")
    public String mostrar() {
        return banner;
    }
}
