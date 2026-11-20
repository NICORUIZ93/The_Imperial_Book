package academia.discovery.servidor;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.ConfigurableApplicationContext;

/** Registro de servicios. Lee su configuración de servidor.yml (no de application.yml). */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServidorApp {

    public static ConfigurableApplicationContext arrancar(String... args) {
        return new SpringApplicationBuilder(EurekaServidorApp.class)
            .properties("spring.config.name=servidor")
            .run(args);
    }

    public static void main(String[] args) {
        arrancar(args);
    }
}
