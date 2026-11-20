package academia.app;

import academia.saludo.autoconfigure.FirmaFormal;
import academia.saludo.autoconfigure.Saludador;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

/** La app NO declara ningún Saludador: lo recibe de la auto-configuración. */
@SpringBootApplication
public class SaludoApp {
    public static void main(String[] args) {
        try (ConfigurableApplicationContext contexto = SpringApplication.run(SaludoApp.class, args)) {
            System.out.println(contexto.getBean(Saludador.class).saludar("Ana"));
            System.out.println("¿Hay FirmaFormal? " + !contexto.getBeansOfType(FirmaFormal.class).isEmpty());
        }
    }
}
