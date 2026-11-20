package academia.nats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F080 · Inventario responde por request-reply; avisos en fan-out y en queue group; pagos en JetStream. */
@SpringBootApplication
public class NatsApp {

    public static void main(String[] args) {
        SpringApplication.run(NatsApp.class, args);
    }
}
