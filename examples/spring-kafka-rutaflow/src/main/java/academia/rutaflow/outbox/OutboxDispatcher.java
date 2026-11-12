package academia.rutaflow.outbox;

import academia.rutaflow.event.EnvioCreado;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OutboxDispatcher {
    private final JdbcTemplate jdbc;
    private final KafkaTemplate<String, EnvioCreado> kafka;
    private final ObjectMapper json;
    private final Clock clock;

    public OutboxDispatcher(JdbcTemplate jdbc, KafkaTemplate<String, EnvioCreado> kafka,
            ObjectMapper json, Clock clock) {
        this.jdbc = jdbc;
        this.kafka = kafka;
        this.json = json;
        this.clock = clock;
    }

    public int publicarPendientes() throws Exception {
        List<Pendiente> pendientes = jdbc.query("""
                SELECT event_id, aggregate_id, payload
                FROM outbox_event
                WHERE published_at IS NULL
                ORDER BY created_at
                LIMIT 50
                """, (rs, row) -> new Pendiente(
                        rs.getObject("event_id", UUID.class),
                        rs.getObject("aggregate_id", UUID.class),
                        rs.getString("payload")));

        int publicados = 0;
        for (Pendiente pendiente : pendientes) {
            try {
                EnvioCreado evento = json.readValue(pendiente.payload(), EnvioCreado.class);
                kafka.send(academia.rutaflow.event.EnvioEventPublisher.TOPIC,
                        pendiente.aggregateId().toString(), evento)
                        .get(5, TimeUnit.SECONDS);
                jdbc.update("""
                        UPDATE outbox_event
                        SET published_at = ?, attempts = attempts + 1
                        WHERE event_id = ? AND published_at IS NULL
                        """, clock.instant(), pendiente.eventId());
                publicados++;
            } catch (Exception error) {
                jdbc.update("UPDATE outbox_event SET attempts = attempts + 1 WHERE event_id = ?",
                        pendiente.eventId());
                throw error;
            }
        }
        return publicados;
    }

    private record Pendiente(UUID eventId, UUID aggregateId, String payload) {}
}
