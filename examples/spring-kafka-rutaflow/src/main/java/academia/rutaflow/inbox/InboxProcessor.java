package academia.rutaflow.inbox;

import academia.rutaflow.event.EnvioCreado;
import java.time.Clock;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InboxProcessor {
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public InboxProcessor(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional
    public boolean procesar(EnvioCreado evento) {
        Integer existente = jdbc.queryForObject(
                "SELECT COUNT(*) FROM evento_procesado WHERE event_id = ?",
                Integer.class, evento.eventId());
        if (existente != null && existente > 0) {
            return false;
        }

        jdbc.update("INSERT INTO evento_procesado (event_id, processed_at) VALUES (?, ?)",
                evento.eventId(), clock.instant());
        int actualizados = jdbc.update("""
                UPDATE route_projection
                SET referencia = ?, updated_at = ?
                WHERE envio_id = ?
                """, evento.referencia(), clock.instant(), evento.envioId());
        if (actualizados == 0) {
            jdbc.update("""
                    INSERT INTO route_projection (envio_id, referencia, updated_at)
                    VALUES (?, ?, ?)
                    """, evento.envioId(), evento.referencia(), clock.instant());
        }
        return true;
    }
}
