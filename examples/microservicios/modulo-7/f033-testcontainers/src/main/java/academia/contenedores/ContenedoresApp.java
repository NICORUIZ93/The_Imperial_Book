package academia.contenedores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F033 · Repositorio con SQL propio de PostgreSQL. Para ejecutarlo en desarrollo: ../gradlew bootTestRun */
@SpringBootApplication
public class ContenedoresApp {
    public static void main(String[] args) {
        SpringApplication.run(ContenedoresApp.class, args);
    }
}
