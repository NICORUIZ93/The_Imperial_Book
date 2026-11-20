package academia.ioc;

import java.time.Clock;
import java.time.ZoneId;
import java.util.Arrays;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class IocApp {

    // @Bean: registras en el contenedor un objeto que no es tuyo (Clock es del JDK).
    @Bean
    Clock reloj() {
        return Clock.system(ZoneId.of("America/Bogota"));
    }

    public static void main(String[] args) {
        // El ApplicationContext ES el contenedor IoC: crea, conecta y destruye los beans.
        try (ConfigurableApplicationContext contexto = SpringApplication.run(IocApp.class, args)) {
            ServicioPedidos servicio = contexto.getBean(ServicioPedidos.class);
            System.out.println(servicio.confirmar("P-1"));
            System.out.println("¿Mismo objeto? " + (servicio == contexto.getBean(ServicioPedidos.class)));
            System.out.println("Beans propios: " + Arrays.stream(contexto.getBeanDefinitionNames())
                .filter(n -> n.matches("servicioPedidos|notificadorCorreo|auditorDeBeans|reloj"))
                .sorted().toList());
        } // al salir del try el contexto se cierra y llama a @PreDestroy y destroy()
    }
}
