package academia.rutaflow.idempotency;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdempotencyService {
    private final JdbcTemplate jdbc;

    public IdempotencyService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public boolean register(String key) {
        int inserted = jdbc.update("""
            INSERT INTO idempotency_record (operation_key)
            VALUES (?)
            ON CONFLICT (operation_key) DO NOTHING
            """, key);
        return inserted == 1;
    }

    public int count(String key) {
        return jdbc.queryForObject(
            "SELECT COUNT(*) FROM idempotency_record WHERE operation_key = ?", Integer.class, key);
    }
}
