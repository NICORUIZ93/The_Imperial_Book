package com.academia.rutaflow.envio;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EnvioRepository {
    private final JdbcTemplate jdbc;

    public EnvioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void guardar(UUID envioId, String referencia, Instant createdAt) {
        jdbc.update("""
                INSERT INTO envio (envio_id, referencia, created_at)
                VALUES (?, ?, ?)
                """, envioId, referencia, Timestamp.from(createdAt));
    }
}
