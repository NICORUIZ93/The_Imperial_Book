package com.academia.rutaflow.outbox;

import java.time.Instant;
import java.util.UUID;

public record OutboxEvent(
        UUID eventId,
        UUID aggregateId,
        String payload,
        Instant createdAt,
        int attempts) {
}
