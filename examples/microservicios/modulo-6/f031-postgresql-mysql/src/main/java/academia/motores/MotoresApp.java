package academia.motores;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.simple.JdbcClient;

@SpringBootApplication
public class MotoresApp {

    @Bean
    ApplicationRunner demo(Inventario inventario, ProductoRepository repo, JdbcClient jdbc) {
        return args -> {
            repo.deleteAll();
            inventario.sumarStock("CAF-1", "Café de Huila", 10);
            inventario.sumarStock("CAF-1", "Café de Huila", 5);
            String version = jdbc.sql("SELECT version()").query(String.class).single();
            System.out.println("Motor: " + version.split(" on ")[0]);
            System.out.println("Stock CAF-1: " + repo.findBySku("CAF-1").orElseThrow().getStock());
            System.out.println("¿'CAFE DE HUILA' = 'Café de Huila'? " + (repo.countByNombre("CAFE DE HUILA") == 1));
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(MotoresApp.class, args).close();
    }
}
