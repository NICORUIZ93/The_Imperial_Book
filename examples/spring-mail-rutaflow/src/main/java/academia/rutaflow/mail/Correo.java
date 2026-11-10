package academia.rutaflow.mail;

import java.util.UUID;

public record Correo(UUID eventId, UUID envioId, String destinatario, String asunto, String texto) { }
