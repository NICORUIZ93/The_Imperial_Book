package academia.config.servidor;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.context.ConfigurableApplicationContext;

/** Config Server: GET /{aplicacion}/{perfil} devuelve la configuración mezclada. Config: servidor.yml. */
@SpringBootApplication
@EnableConfigServer
public class ConfigServidorApp {

    public static ConfigurableApplicationContext arrancar(String... args) {
        return new SpringApplicationBuilder(ConfigServidorApp.class)
            .properties("spring.config.name=servidor")
            .run(args);
    }

    public static void main(String[] args) {
        arrancar(args);
    }
}
