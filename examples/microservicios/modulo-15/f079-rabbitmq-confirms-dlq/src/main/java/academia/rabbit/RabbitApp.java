package academia.rabbit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F079 · Pedidos por RabbitMQ sin perder nada: confirmaciones al publicar y cola de mensajes muertos. */
@SpringBootApplication
public class RabbitApp {

    public static void main(String[] args) {
        SpringApplication.run(RabbitApp.class, args);
    }
}
