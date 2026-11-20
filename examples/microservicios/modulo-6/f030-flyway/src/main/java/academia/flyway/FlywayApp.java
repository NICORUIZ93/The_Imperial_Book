package academia.flyway;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.simple.JdbcClient;

@SpringBootApplication
public class FlywayApp {

    @Bean
    ApplicationRunner historial(JdbcClient jdbc) {
        return args -> {
            jdbc.sql("SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank")
                .query((rs, n) -> "Migración " + rs.getString(1) + " · " + rs.getString(2) + " · ok=" + rs.getBoolean(3))
                .list().forEach(System.out::println);
            jdbc.sql("SELECT sku, stock FROM productos ORDER BY sku")
                .query((rs, n) -> "Producto " + rs.getString(1) + " · stock=" + rs.getInt(2))
                .list().forEach(System.out::println);
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(FlywayApp.class, args).close();
    }
}
