package academia.rutaflow.mail;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class MailOutboxDispatcher {
    private static final int MAX_INTENTOS = 3;
    private final JdbcTemplate jdbc;
    private final CorreoGateway gateway;
    private final Clock clock;

    public MailOutboxDispatcher(JdbcTemplate jdbc, CorreoGateway gateway, Clock clock) {
        this.jdbc = jdbc;
        this.gateway = gateway;
        this.clock = clock;
    }

    public int enviarPendientes() {
        List<CorreoPendiente> pendientes = jdbc.query("""
                SELECT event_id, envio_id, destinatario, asunto, cuerpo, intentos, next_attempt_at
                FROM correo_outbox
                WHERE sent_at IS NULL AND dead_lettered_at IS NULL AND next_attempt_at <= ?
                ORDER BY next_attempt_at
                FETCH FIRST 20 ROWS ONLY
                """, (rs, row) -> new CorreoPendiente(
                    rs.getObject("event_id", java.util.UUID.class),
                    rs.getObject("envio_id", java.util.UUID.class),
                    rs.getString("destinatario"), rs.getString("asunto"), rs.getString("cuerpo"),
                    rs.getInt("intentos"), rs.getTimestamp("next_attempt_at").toInstant()),
                Timestamp.from(clock.instant()));

        int enviados = 0;
        for (CorreoPendiente pendiente : pendientes) {
            try {
                gateway.enviar(new Correo(pendiente.eventId(), pendiente.envioId(),
                        pendiente.destinatario(), pendiente.asunto(), pendiente.texto()));
                jdbc.update("UPDATE correo_outbox SET sent_at = ?, intentos = intentos + 1 WHERE event_id = ?",
                        Timestamp.from(clock.instant()), pendiente.eventId());
                enviados++;
            } catch (RuntimeException error) {
                registrarFallo(pendiente, error);
            }
        }
        return enviados;
    }

    private void registrarFallo(CorreoPendiente pendiente, RuntimeException error) {
        int siguienteIntento = pendiente.intentos() + 1;
        Instant ahora = clock.instant();
        if (siguienteIntento >= MAX_INTENTOS) {
            jdbc.update("""
                    UPDATE correo_outbox
                    SET intentos = ?, dead_lettered_at = ?, last_error = ?
                    WHERE event_id = ?
                    """, siguienteIntento, Timestamp.from(ahora), error.getClass().getSimpleName(),
                    pendiente.eventId());
            return;
        }
        long demoraSegundos = Math.min(300, 30L << pendiente.intentos());
        jdbc.update("""
                UPDATE correo_outbox
                SET intentos = ?, next_attempt_at = ?, last_error = ?
                WHERE event_id = ?
                """, siguienteIntento, Timestamp.from(ahora.plusSeconds(demoraSegundos)),
                error.getClass().getSimpleName(), pendiente.eventId());
    }
}
