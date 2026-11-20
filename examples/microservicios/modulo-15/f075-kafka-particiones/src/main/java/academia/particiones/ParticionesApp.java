package academia.particiones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F075 · Un topic de 3 particiones, un productor con clave y dos consumer groups. */
@SpringBootApplication
public class ParticionesApp {

    public static void main(String[] args) {
        SpringApplication.run(ParticionesApp.class, args);
    }
}
