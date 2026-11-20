package academia.cache;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F037 · Catálogo con caché en Redis. Arranca con: ../mvnw spring-boot:run (con Redis en localhost:6379). */
@SpringBootApplication
public class CacheApp {
    public static void main(String[] args) {
        SpringApplication.run(CacheApp.class, args);
    }
}
