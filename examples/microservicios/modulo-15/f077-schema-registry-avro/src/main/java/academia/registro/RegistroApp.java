package academia.registro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F077 · Pedidos en Avro con el contrato guardado en Schema Registry. */
@SpringBootApplication
public class RegistroApp {

    public static void main(String[] args) {
        // Avro 1.12.2 solo confía en los paquetes que le indiques (protección contra clases arbitrarias en un
        // esquema). Debe fijarse ANTES de usar Avro; en producción, mejor como -D en el arranque de la JVM.
        if (System.getProperty("org.apache.avro.SERIALIZABLE_PACKAGES") == null) {
            System.setProperty("org.apache.avro.SERIALIZABLE_PACKAGES", "academia.avro");
        }
        SpringApplication.run(RegistroApp.class, args);
    }
}
