package academia.liquibase;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.simple.JdbcClient;

@SpringBootApplication
public class LiquibaseApp {

    @Bean
    ApplicationRunner historial(JdbcClient jdbc) {
        return args -> jdbc.sql("SELECT id, exectype FROM databasechangelog ORDER BY orderexecuted")
            .query((rs, n) -> "ChangeSet " + rs.getString(1) + " · " + rs.getString(2))
            .list().forEach(System.out::println);
    }

    public static void main(String[] args) {
        SpringApplication.run(LiquibaseApp.class, args).close();
    }
}
