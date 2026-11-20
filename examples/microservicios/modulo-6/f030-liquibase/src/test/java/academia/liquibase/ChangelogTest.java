package academia.liquibase;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

/** Requiere el PostgreSQL del módulo (docker compose up -d --wait). */
@SpringBootTest(properties = "spring.main.web-application-type=none")
class ChangelogTest {

    @Autowired JdbcClient jdbc;

    @Test
    void losDosChangeSetsEstanRegistrados() {
        List<String> ids = jdbc.sql("SELECT id FROM databasechangelog ORDER BY orderexecuted")
            .query(String.class).list();
        assertThat(ids).containsExactly("1-crear-productos", "2-agregar-stock");
    }

    @Test
    void laColumnaStockExisteConSuValorPorDefecto() {
        Integer stock = jdbc.sql("SELECT stock FROM productos WHERE sku = 'CAF-1'").query(Integer.class).single();
        assertThat(stock).isZero();
    }
}
