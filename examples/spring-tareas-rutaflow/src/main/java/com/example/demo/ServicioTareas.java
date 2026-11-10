package com.example.demo;

import org.springframework.stereotype.Service;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class ServicioTareas {
    private final TareaRepository repository;
    private final TareaMapper mapper;
    private final Counter tareasCreadas;

    public ServicioTareas(TareaRepository repository, TareaMapper mapper, MeterRegistry registry) {
        this.repository = repository;
        this.mapper = mapper;
        this.tareasCreadas = Counter.builder("rutaflow.tareas.creadas").tag("origen", "api").register(registry);
    }

    public TareaDTO crear(CrearTareaRequest request) {
        Tarea tarea = new Tarea(
                request.titulo(), request.prioridad(), "BODEGA-A");
        TareaDTO creada = mapper.toDto(repository.save(tarea));
        tareasCreadas.increment();
        return creada;
    }

    public TareaDTO buscar(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new TareaNoEncontradaException(id));
    }
}
