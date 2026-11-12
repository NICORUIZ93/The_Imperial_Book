package academia.rutaflow.sagarecovery;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class CompensationRecoveryTest {
    private static final String DATABASE_FILE = createDatabaseFile();
    private static final String DATABASE_URL = "jdbc:h2:file:" + DATABASE_FILE + ";DB_CLOSE_ON_EXIT=FALSE";

    @Autowired
    private CompensationService compensation;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private DataSource dataSource;

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> DATABASE_URL);
    }

    @Test
    void pendingCompensationSurvivesRestartAndRetryDoesNotApplyItsEffectTwice() {
        compensation.schedule("comp-1", "reservation-1");
        compensation.failAfterInventoryChangeOnce();

        assertThatThrownBy(() -> compensation.compensate("comp-1"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("simulated crash before marking compensation DONE");
        assertThat(released("reservation-1")).isFalse();
        assertThat(status("comp-1")).isEqualTo("PENDING");

        // Closing this pool represents the end of one process. The next service
        // instance opens the same file-backed database, as after a restart.
        ((HikariDataSource) dataSource).close();
        DriverManagerDataSource reopened = new DriverManagerDataSource(DATABASE_URL, "sa", "");
        JdbcTemplate afterRestart = new JdbcTemplate(reopened);
        CompensationService restartedService = new CompensationService(afterRestart,
            new DataSourceTransactionManager(reopened));

        assertThat(restartedService.compensate("comp-1")).isEqualTo("DONE");
        assertThat(restartedService.compensate("comp-1")).isEqualTo("ALREADY_DONE");
        assertThat(afterRestart.queryForObject(
            "SELECT release_count FROM inventory_reservation WHERE id = ?", Integer.class, "reservation-1"))
            .isEqualTo(1);
        assertThat(afterRestart.queryForObject(
            "SELECT status FROM compensation_job WHERE id = ?", String.class, "comp-1"))
            .isEqualTo("DONE");
    }

    private boolean released(String reservationId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT released FROM inventory_reservation WHERE id = ?", Boolean.class, reservationId));
    }

    private String status(String compensationId) {
        return jdbc.queryForObject("SELECT status FROM compensation_job WHERE id = ?", String.class, compensationId);
    }

    private static String createDatabaseFile() {
        try {
            Path directory = Files.createTempDirectory("rutaflow-saga-");
            return directory.resolve("recovery-" + UUID.randomUUID()).toString();
        } catch (Exception failure) {
            throw new ExceptionInInitializerError(failure);
        }
    }
}
