package academia.rutaflow.outbox;

import academia.rutaflow.event.EnvioCreado;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CrearEnvioService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final Clock clock;

    public CrearEnvioService(JdbcTemplate jdbc, ObjectMapper json, Clock clock) {
        this.jdbc = jdbc;
        this.json = json;
        this.clock = clock;
    }

    @Transactional
    public EnvioCreado crear(String referencia) {
        UUID envioId = UUID.randomUUID();
        EnvioCreado evento = new EnvioCreado(
                UUID.randomUUID(), envioId, 1, clock.instant(), referencia);
        try {
            String payload = json.writeValueAsString(evento);
            jdbc.update("INSERT INTO envio (envio_id, referencia) VALUES (?, ?)", envioId, referencia);
            jdbc.update("""
                    INSERT INTO outbox_event
                        (event_id, aggregate_id, event_type, payload, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    """, evento.eventId(), envioId, "EnvioCreado", payload, evento.occurredAt());
            return evento;
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("No se pudo serializar EnvioCreado", error);
        }
    }
}
