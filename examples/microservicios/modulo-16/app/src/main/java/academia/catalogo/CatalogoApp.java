package academia.catalogo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** Módulo 12 · El servicio «catalogo»: la misma imagen viaja de Docker a Compose, Kubernetes, Helm y Argo CD. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class CatalogoApp {

    public static void main(String[] args) {
        SpringApplication.run(CatalogoApp.class, args);
    }
}
