package academia.rutaflow.event;

import java.time.Instant;
import java.util.UUID;

public record EnvioCreado(UUID eventId, UUID envioId, int version, Instant occurredAt, String referencia) {}
