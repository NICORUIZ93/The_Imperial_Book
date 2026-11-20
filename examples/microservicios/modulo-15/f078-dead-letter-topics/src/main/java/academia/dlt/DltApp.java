package academia.dlt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F078 · Cobros: lo transitorio se reintenta, lo imposible va al Dead Letter Topic sin bloquear la partición. */
@SpringBootApplication
public class DltApp {

    public static void main(String[] args) {
        SpringApplication.run(DltApp.class, args);
    }
}
