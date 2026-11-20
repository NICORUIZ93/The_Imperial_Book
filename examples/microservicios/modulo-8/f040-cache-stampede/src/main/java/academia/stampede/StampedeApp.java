package academia.stampede;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F040 · Estampida de caché y su solución con un candado por clave en Redis. */
@SpringBootApplication
public class StampedeApp {
    public static void main(String[] args) {
        SpringApplication.run(StampedeApp.class, args);
    }
}
