package academia.rutaflow.containers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;

abstract class SharedPostgres {
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine")
        .withDatabaseName("rutaflow")
        .withUsername("rutaflow")
        .withPassword("local-test-only");
    private static final Map<String, String> IDS_BY_TEST_CLASS = new ConcurrentHashMap<>();

    static {
        POSTGRES.start();
    }

    protected final void queryAndRecordContainerId() throws Exception {
        try (Connection connection = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("SELECT 1")) {
            assertThat(result.next()).isTrue();
            assertThat(result.getInt(1)).isEqualTo(1);
        }

        String className = getClass().getSimpleName();
        String containerId = POSTGRES.getContainerId();
        IDS_BY_TEST_CLASS.put(className, containerId);
        System.out.printf("%s usa containerId=%s%n", className, containerId);
    }

    @AfterAll
    static void verifyBothTestClassesUsedOneContainer() {
        if (IDS_BY_TEST_CLASS.size() == 2) {
            assertThat(IDS_BY_TEST_CLASS.values())
                .containsOnly(POSTGRES.getContainerId());
        }
    }
}
