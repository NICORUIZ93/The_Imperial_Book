package academia.rutaflow.mail;

import java.time.Instant;
import java.util.UUID;

record CorreoPendiente(UUID eventId, UUID envioId, String destinatario,
                       String asunto, String texto, int intentos, Instant nextAttemptAt) { }
