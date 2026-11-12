package com.example.demo;

import org.springframework.stereotype.Component;

@Component
public class ServicioExterno {
    private volatile boolean disponible = true;

    public boolean estaDisponible() { return disponible; }
    public void marcarComoNoDisponible() { disponible = false; }
    public void marcarComoDisponible() { disponible = true; }
}
