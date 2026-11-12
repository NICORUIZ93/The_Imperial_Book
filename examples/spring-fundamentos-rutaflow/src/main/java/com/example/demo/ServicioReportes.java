package com.example.demo;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Service
public class ServicioReportes {
    private final GeneradorReporte recibidoAlCrear;
    private final ObjectProvider<GeneradorReporte> generadores;

    public ServicioReportes(
            GeneradorReporte recibidoAlCrear,
            ObjectProvider<GeneradorReporte> generadores) {
        this.recibidoAlCrear = recibidoAlCrear;
        this.generadores = generadores;
    }

    public String comparar() {
        return "directo=" + recibidoAlCrear.id()
                + "; nuevos=" + generadores.getObject().id()
                + "," + generadores.getObject().id();
    }
}
