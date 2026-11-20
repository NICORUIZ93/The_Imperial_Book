package academia.redlock;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/** F039 · Redlock sobre 3 nodos + fencing tokens comprobados por el almacén. */
@SpringBootApplication
public class RedlockApp {

    public static void main(String[] args) {
        SpringApplication.run(RedlockApp.class, args);
    }

    /** destroyMethod "close": Spring cierra las 3 conexiones al apagar. */
    @Bean(destroyMethod = "close")
    Redlock redlock(@Value("${redlock.nodos}") List<String> nodos) {
        return new Redlock(nodos);
    }
}
