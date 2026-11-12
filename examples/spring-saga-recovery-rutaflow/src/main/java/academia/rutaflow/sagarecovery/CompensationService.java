package academia.rutaflow.sagarecovery;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class CompensationService {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;
    private final AtomicBoolean failAfterInventoryChange = new AtomicBoolean();

    public CompensationService(JdbcTemplate jdbc, PlatformTransactionManager transactionManager) {
        this.jdbc = jdbc;
        this.transaction = new TransactionTemplate(transactionManager);
    }

    public void schedule(String compensationId, String reservationId) {
        transaction.executeWithoutResult(status -> {
            jdbc.update("INSERT INTO inventory_reservation(id, released, release_count) VALUES (?, FALSE, 0)",
                reservationId);
            jdbc.update("INSERT INTO compensation_job(id, reservation_id, status) VALUES (?, ?, 'PENDING')",
                compensationId, reservationId);
        });
    }

    public String compensate(String compensationId) {
        return transaction.execute(status -> {
            CompensationJob job = jdbc.queryForObject(
                "SELECT reservation_id, status FROM compensation_job WHERE id = ? FOR UPDATE",
                (row, index) -> new CompensationJob(row.getString("reservation_id"), row.getString("status")),
                compensationId);

            if ("DONE".equals(job.status())) {
                return "ALREADY_DONE";
            }
            jdbc.update("UPDATE inventory_reservation SET released = TRUE, release_count = release_count + 1 " +
                "WHERE id = ?", job.reservationId());

            if (failAfterInventoryChange.compareAndSet(true, false)) {
                throw new IllegalStateException("simulated crash before marking compensation DONE");
            }

            jdbc.update("UPDATE compensation_job SET status = 'DONE' WHERE id = ? AND status = 'PENDING'",
                compensationId);
            return "DONE";
        });
    }

    public void failAfterInventoryChangeOnce() {
        failAfterInventoryChange.set(true);
    }

    private record CompensationJob(String reservationId, String status) {}
}
