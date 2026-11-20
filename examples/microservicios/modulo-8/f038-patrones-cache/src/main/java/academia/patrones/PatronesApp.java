package academia.patrones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/** F038 · Los tres patrones de escritura/lectura de caché sobre Redis + PostgreSQL. */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class PatronesApp {
    public static void main(String[] args) {
        SpringApplication.run(PatronesApp.class, args);
    }
}
