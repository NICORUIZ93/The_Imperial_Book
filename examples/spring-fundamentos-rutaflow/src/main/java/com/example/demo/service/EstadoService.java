package com.example.demo.service;

import com.example.demo.repository.EstadoRepository;
import org.springframework.stereotype.Service;

@Service
public class EstadoService {
    private final EstadoRepository repository;

    public EstadoService(EstadoRepository repository) {
        this.repository = repository;
    }

    public String consultar(String codigo) {
        return repository.buscar(codigo);
    }
}
