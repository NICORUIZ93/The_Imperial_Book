package academia.contenedores;

import org.springframework.boot.SpringApplication;

/** ../gradlew bootTestRun arranca ESTA clase: la app real + un PostgreSQL en Docker. */
public class ContenedoresAppDeDesarrollo {
    public static void main(String[] args) {
        SpringApplication.from(ContenedoresApp::main).with(ContenedoresDeDesarrollo.class).run(args);
    }
}
