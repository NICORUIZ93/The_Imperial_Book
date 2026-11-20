package academia.flyway;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

/** Requiere el PostgreSQL del módulo (docker compose up -d --wait). */
@SpringBootTest(properties = "spring.main.web-application-type=none")
class MigracionesFlywayTest {

    @Autowired JdbcClient jdbc;
    @Autowired Flyway flyway;

    @Test
    void lasDosMigracionesQuedaronAplicadasEnOrden() {
        List<String> versiones = jdbc.sql(
                "SELECT version FROM flyway_schema_history WHERE success ORDER BY installed_rank")
            .query(String.class).list();
        assertThat(versiones).containsExactly("1", "2");
    }

    @Test
    void elEsquemaTieneLaColumnaDeV2ConSuValor() {
        Integer stock = jdbc.sql("SELECT stock FROM productos WHERE sku = 'CAF-1'").query(Integer.class).single();
        assertThat(stock).isEqualTo(10);
    }

    @Test
    void validateNoEncuentraDiferencias() {
        // Compara checksums de los archivos con los guardados en flyway_schema_history.
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();
    }
}
