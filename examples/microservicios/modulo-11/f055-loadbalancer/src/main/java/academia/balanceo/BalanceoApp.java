package academia.balanceo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;

@SpringBootApplication
public class BalanceoApp {

    /** @LoadBalanced: "http://catalogo" deja de ser un host y pasa a ser un NOMBRE de servicio. */
    @Bean
    @LoadBalanced
    RestClient.Builder restClientBalanceado() {
        return RestClient.builder();
    }

    /** Para el laboratorio: --demo.llamadas=6 hace 6 llamadas e imprime quién atendió cada una. */
    @Bean
    CommandLineRunner demo(CatalogoCliente cliente, @Value("${demo.llamadas:0}") int llamadas) {
        return args -> {
            for (int i = 1; i <= llamadas; i++) {
                String quien;
                try {
                    quien = cliente.quienAtiende();
                } catch (RuntimeException e) {
                    quien = "ERROR " + e.getClass().getSimpleName();
                }
                System.out.println("llamada " + i + " -> " + quien);
            }
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(BalanceoApp.class, args);
    }
}
