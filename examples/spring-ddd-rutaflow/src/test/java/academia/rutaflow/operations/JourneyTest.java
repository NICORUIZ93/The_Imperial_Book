package academia.rutaflow.operations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class JourneyTest {
    @Test
    void unaJornadaCerradaRechazaNuevasPosiciones() {
        Journey journey = new Journey();
        journey.record(new Position(10.0, 20.0));
        journey.close();

        assertThatThrownBy(() -> journey.record(new Position(11.0, 21.0)))
            .isInstanceOf(JourneyAlreadyClosed.class);
        assertThat(journey.positions()).hasSize(1);
    }

    @Test
    void unaJornadaAbiertaAceptaPosiciones() {
        Journey journey = new Journey();
        journey.record(new Position(10.0, 20.0));
        journey.record(new Position(11.0, 21.0));

        assertThat(journey.positions()).hasSize(2);
    }

    @Test
    void laListaExpuestaNoPermiteModificarElAgregado() {
        Journey journey = new Journey();
        journey.record(new Position(10.0, 20.0));

        assertThatThrownBy(() -> journey.positions().clear())
            .isInstanceOf(UnsupportedOperationException.class);
        assertThat(journey.positions()).hasSize(1);
    }
}
