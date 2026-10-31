package com.academia.rutaflow.outbox;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.academia.rutaflow.event.EnvioCreado;

@Repository
public class OutboxRepository {
    private static final RowMapper<OutboxEvent> EVENT_ROW_MAPPER = OutboxRepository::mapEvent;
    private final JdbcTemplate jdbc;

    public OutboxRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void guardar(EnvioCreado evento, String payload, Instant createdAt) {
        jdbc.update("""
                INSERT INTO outbox_event (
                    event_id, aggregate_id, event_type, payload, created_at, next_attempt_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                evento.eventId(),
                evento.envioId(),
                EnvioCreado.class.getSimpleName(),
                payload,
                Timestamp.from(createdAt),
                Timestamp.from(createdAt));
    }

    @Transactional
    public List<OutboxEvent> reclamarLote(int limit, Instant now, Instant leaseUntil) {
        if (limit < 1) {
            throw new IllegalArgumentException("El límite del lote debe ser positivo");
        }

        List<OutboxEvent> events = jdbc.query("""
                SELECT event_id, aggregate_id, payload, created_at, attempts
                FROM outbox_event
                WHERE published_at IS NULL
                  AND next_attempt_at <= ?
                  AND (lease_until IS NULL OR lease_until < ?)
                ORDER BY created_at, event_id
                LIMIT ?
                FOR UPDATE SKIP LOCKED
                """, EVENT_ROW_MAPPER, Timestamp.from(now), Timestamp.from(now), limit);

        for (OutboxEvent event : events) {
            int updated = jdbc.update("""
                    UPDATE outbox_event
                    SET lease_until = ?, attempts = attempts + 1
                    WHERE event_id = ? AND published_at IS NULL
                    """, Timestamp.from(leaseUntil), event.eventId());
            if (updated != 1) {
                throw new IllegalStateException("No se pudo reclamar el evento " + event.eventId());
            }
        }
        return events;
    }

    @Transactional
    public void marcarPublicado(UUID eventId, Instant publishedAt) {
        int updated = jdbc.update("""
                UPDATE outbox_event
                SET published_at = ?, lease_until = NULL, last_error = NULL
                WHERE event_id = ? AND published_at IS NULL
                """, Timestamp.from(publishedAt), eventId);
        if (updated != 1) {
            throw new IllegalStateException("No se pudo marcar publicado el evento " + eventId);
        }
    }

    @Transactional
    public void programarReintento(OutboxEvent event, Instant now, String cause) {
        long backoffSeconds = Math.min(300L, 1L << Math.min(event.attempts(), 8));
        String boundedCause = cause.length() <= 1_000 ? cause : cause.substring(0, 1_000);
        int updated = jdbc.update("""
                UPDATE outbox_event
                SET lease_until = NULL, next_attempt_at = ?, last_error = ?
                WHERE event_id = ? AND published_at IS NULL
                """,
                Timestamp.from(now.plusSeconds(backoffSeconds)),
                boundedCause,
                event.eventId());
        if (updated != 1) {
            throw new IllegalStateException("No se pudo programar el reintento de " + event.eventId());
        }
    }

    private static OutboxEvent mapEvent(ResultSet resultSet, int rowNum) throws SQLException {
        return new OutboxEvent(
                resultSet.getObject("event_id", UUID.class),
                resultSet.getObject("aggregate_id", UUID.class),
                resultSet.getString("payload"),
                resultSet.getTimestamp("created_at").toInstant(),
                resultSet.getInt("attempts"));
    }
}
