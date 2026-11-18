package academia.rutaflow.mail;

import java.time.Clock;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfirmarEnvioService {
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public ConfirmarEnvioService(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional
    public UUID confirmar(String referencia, String destinatario) {
        UUID envioId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        String asunto = "Envío confirmado";
        String texto = "La referencia " + referencia + " fue confirmada.";
        jdbc.update("INSERT INTO envio (envio_id, referencia) VALUES (?, ?)", envioId, referencia);
        jdbc.update("""
                INSERT INTO correo_outbox
                    (event_id, envio_id, destinatario, asunto, cuerpo, next_attempt_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """, eventId, envioId, destinatario, asunto, texto, clock.instant());
        return envioId;
    }
}
