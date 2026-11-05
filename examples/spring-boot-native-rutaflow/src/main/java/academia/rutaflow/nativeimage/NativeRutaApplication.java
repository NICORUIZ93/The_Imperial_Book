package academia.rutaflow.nativeimage;

import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@ImportRuntimeHints(MensajeHints.class)
public class NativeRutaApplication {
    public static void main(String[] args) {
        SpringApplication.run(NativeRutaApplication.class, args);
    }
}
