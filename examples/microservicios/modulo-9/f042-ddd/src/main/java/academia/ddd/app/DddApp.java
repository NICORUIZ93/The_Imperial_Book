package academia.ddd.app;

import academia.ddd.envios.PlanificadorDeEnvios;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/** Capa de aplicación con Spring: conecta los dos contextos sin que el dominio conozca a Spring. */
@SpringBootApplication
public class DddApp {

    @Bean
    PlanificadorDeEnvios planificadorDeEnvios() {
        return new PlanificadorDeEnvios();
    }

    public static void main(String[] args) {
        SpringApplication.run(DddApp.class, args);
    }
}
