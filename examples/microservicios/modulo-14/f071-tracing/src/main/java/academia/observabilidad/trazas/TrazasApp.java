package academia.observabilidad.trazas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** La misma app hace de "pedidos" o de "inventario" según spring.application.name y el puerto. */
@SpringBootApplication
public class TrazasApp {
    public static void main(String[] args) {
        SpringApplication.run(TrazasApp.class, args);
    }
}
