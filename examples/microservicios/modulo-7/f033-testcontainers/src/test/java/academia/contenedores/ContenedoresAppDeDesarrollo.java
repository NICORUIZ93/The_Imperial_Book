package academia.contenedores;

import org.springframework.boot.SpringApplication;

/** ../mvnw spring-boot:test-run arranca ESTA clase: la app real + un PostgreSQL en Docker. */
public class ContenedoresAppDeDesarrollo {
    public static void main(String[] args) {
        SpringApplication.from(ContenedoresApp::main).with(ContenedoresDeDesarrollo.class).run(args);
    }
}
