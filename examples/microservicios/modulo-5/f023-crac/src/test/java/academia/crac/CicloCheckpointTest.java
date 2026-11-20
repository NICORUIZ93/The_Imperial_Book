package academia.crac;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.WebApplicationType;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * En cualquier JDK (también macOS) simula lo que Spring hace alrededor de un checkpoint:
 * stop() de todos los Lifecycle, checkpoint, y start() al restaurar.
 */
class CicloCheckpointTest {

    @Test
    void elRecursoSeCierraAntesYSeReabreDespues() {
        try (ConfigurableApplicationContext ctx = new SpringApplicationBuilder(CracApp.class)
                .web(WebApplicationType.NONE).run()) {
            ConexionExterna conexion = ctx.getBean(ConexionExterna.class);
            assertThat(conexion.isRunning()).isTrue();
            assertThat(conexion.aperturas()).isEqualTo(1);

            ctx.stop();   // lo que Spring hace justo antes del checkpoint
            assertThat(conexion.isRunning()).isFalse();

            ctx.start();  // lo que Spring hace justo después del restore
            assertThat(conexion.isRunning()).isTrue();
            assertThat(conexion.aperturas()).isEqualTo(2);
        }
    }
}
