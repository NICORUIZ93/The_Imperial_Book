package academia.catalogo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Simula una tarea de arranque (calentar una caché, migrar datos). Mientras corre, la app está «viva» (liveness UP)
 * pero «no lista» (readiness todavía no es ACCEPTING_TRAFFIC): Spring publica ACCEPTING_TRAFFIC al terminar los runners.
 */
@Component
class ArranqueLento implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ArranqueLento.class);
    private final CatalogoProperties props;

    ArranqueLento(CatalogoProperties props) {
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (props.arranqueLentoSegundos() > 0) {
            log.info("Calentando caché durante {} s...", props.arranqueLentoSegundos());
            Thread.sleep(props.arranqueLentoSegundos() * 1000L);
            log.info("Caché caliente");
        }
    }
}
