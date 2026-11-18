package com.example.demo.controller;

import com.example.demo.service.EstadoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EstadoController {
    private final EstadoService service;

    public EstadoController(EstadoService service) {
        this.service = service;
    }

    @GetMapping("/envios/{codigo}/estado")
    public String estado(@PathVariable String codigo) {
        return service.consultar(codigo);
    }
}
