package academia.capas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F035 · Servicio de pedidos en capas: controller -> servicio -> repositorio. ArchUnit vigila que siga así. */
@SpringBootApplication
public class CapasApp {
    public static void main(String[] args) {
        SpringApplication.run(CapasApp.class, args);
    }
}
