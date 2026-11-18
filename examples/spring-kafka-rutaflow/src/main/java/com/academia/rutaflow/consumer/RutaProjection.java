package com.academia.rutaflow.consumer;

import java.time.Instant;
import java.util.UUID;

public record RutaProjection(
        UUID envioId,
        String referencia,
        String estado,
        Instant updatedAt) {
}
