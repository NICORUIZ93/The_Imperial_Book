package com.example.demo.repository;

import org.springframework.stereotype.Repository;

@Repository
public class EstadoRepository {
    public String buscar(String codigo) {
        return "En ruta: " + codigo;
    }
}
