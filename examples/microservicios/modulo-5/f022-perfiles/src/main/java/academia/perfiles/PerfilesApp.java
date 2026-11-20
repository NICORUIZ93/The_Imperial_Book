package academia.perfiles;

import java.util.Arrays;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PerfilesApp {

    @Bean
    ApplicationRunner mostrarConfiguracion(TiendaProperties tienda, Environment entorno) {
        return args -> System.out.printf("Perfiles=%s · moneda=%s · descuento-maximo=%d · bd-url=%s%n",
            Arrays.toString(entorno.getActiveProfiles()), tienda.moneda(),
            tienda.descuentoMaximo(), tienda.bdUrl());
    }

    public static void main(String[] args) {
        SpringApplication.run(PerfilesApp.class, args);
    }
}
