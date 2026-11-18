package com.academia.rutaflow.envio;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academia.rutaflow.event.EnvioCreado;
import com.academia.rutaflow.outbox.OutboxRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class CrearEnvioService {
    private final EnvioRepository envios;
    private final OutboxRepository outbox;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public CrearEnvioService(
            EnvioRepository envios,
            OutboxRepository outbox,
            ObjectMapper objectMapper,
            Clock clock) {
        this.envios = envios;
        this.outbox = outbox;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Transactional
    public EnvioCreado crear(String referencia) {
        if (referencia == null || referencia.isBlank()) {
            throw new InvalidEnvioException("La referencia no puede estar vacía");
        }

        UUID envioId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Instant now = clock.instant();
        String referenciaNormalizada = referencia.trim();
        var evento = new EnvioCreado(eventId, envioId, 1, now, referenciaNormalizada);

        envios.guardar(envioId, referenciaNormalizada, now);
        try {
            outbox.guardar(evento, objectMapper.writeValueAsString(evento), now);
        } catch (JacksonException exception) {
            throw new IllegalStateException("No se pudo serializar EnvioCreado para el outbox", exception);
        }
        return evento;
    }
}
