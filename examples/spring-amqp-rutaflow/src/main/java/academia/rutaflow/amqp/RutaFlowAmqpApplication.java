package academia.rutaflow.amqp;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RutaFlowAmqpApplication {

    public static void main(String[] args) {
        SpringApplication.run(RutaFlowAmqpApplication.class, args);
    }

    @Bean
    ApplicationRunner publicarDesdeArgumento(DispatchPublisher publisher) {
        return args -> {
            for (String trackingCode : args.getOptionValues("tracking-code")) {
                publisher.publishAndConfirm(trackingCode);
            }
        };
    }
}
