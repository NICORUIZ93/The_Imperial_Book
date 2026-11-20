package academia.factores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** Factor V (build, release, run): ./gradlew bootJar construye UN jar; el mismo jar corre en todos los entornos. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class DoceFactoresApp {

    public static void main(String[] args) {
        SpringApplication.run(DoceFactoresApp.class, args);
    }
}
