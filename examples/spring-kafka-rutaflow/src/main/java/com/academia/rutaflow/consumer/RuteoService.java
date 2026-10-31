package com.academia.rutaflow.consumer;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academia.rutaflow.event.EnvioCreado;

@Service
public class RuteoService {
    private static final RowMapper<RutaProjection> ROUTE_ROW_MAPPER = RuteoService::mapRoute;
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public RuteoService(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional
    public boolean procesar(EnvioCreado evento) {
        validar(evento);
        if (yaProcesado(evento.eventId())) {
            return false;
        }

        Instant now = clock.instant();
        jdbc.update("""
                INSERT INTO event_inbox (event_id, processed_at)
                VALUES (?, ?)
                """, evento.eventId(), Timestamp.from(now));

        int updated = jdbc.update("""
                UPDATE route_projection
                SET referencia = ?, estado = ?, updated_at = ?
                WHERE envio_id = ?
                """,
                evento.referencia(),
                "RECIBIDO",
                Timestamp.from(now),
                evento.envioId());
        if (updated == 0) {
            jdbc.update("""
                    INSERT INTO route_projection (envio_id, referencia, estado, updated_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    evento.envioId(),
                    evento.referencia(),
                    "RECIBIDO",
                    Timestamp.from(now));
        }
        return true;
    }

    public Optional<RutaProjection> consultar(UUID envioId) {
        return jdbc.query("""
                SELECT envio_id, referencia, estado, updated_at
                FROM route_projection
                WHERE envio_id = ?
                """, ROUTE_ROW_MAPPER, envioId).stream().findFirst();
    }

    private boolean yaProcesado(UUID eventId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM event_inbox WHERE event_id = ?",
                Integer.class,
                eventId);
        return count != null && count > 0;
    }

    private static void validar(EnvioCreado evento) {
        if (evento == null
                || evento.eventId() == null
                || evento.envioId() == null
                || evento.version() < 1
                || evento.occurredAt() == null
                || evento.referencia() == null
                || evento.referencia().isBlank()) {
            throw new InvalidEventException("EnvioCreado no cumple el contrato del consumidor");
        }
    }

    private static RutaProjection mapRoute(ResultSet resultSet, int rowNum) throws SQLException {
        return new RutaProjection(
                resultSet.getObject("envio_id", UUID.class),
                resultSet.getString("referencia"),
                resultSet.getString("estado"),
                resultSet.getTimestamp("updated_at").toInstant());
    }
}
