package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ServicioEnviosCampo {
    @Autowired
    private RepositorioEnvios repositorio;

    public String consultar(String codigo) {
        return repositorio.buscarEstado(codigo);
    }
}
