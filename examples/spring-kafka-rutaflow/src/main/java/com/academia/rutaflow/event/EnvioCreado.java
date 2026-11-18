package com.academia.rutaflow.event;

import java.time.Instant;
import java.util.UUID;

public record EnvioCreado(
        // Identifica una ocurrencia concreta para la deduplicación del consumidor.
        UUID eventId,
        // Identifica el agregado; se usa como key para conservar su orden por partición.
        UUID envioId,
        int version,
        Instant occurredAt,
        String referencia) {
}
