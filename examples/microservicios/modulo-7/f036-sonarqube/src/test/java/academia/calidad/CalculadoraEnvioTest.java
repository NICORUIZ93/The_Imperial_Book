package academia.calidad;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.Test;

class CalculadoraEnvioTest {

    @ParameterizedTest(name = "{0} kg, express={1} -> {2}")
    @CsvSource({"1, false, 7", "1, true, 14", "19, false, 43", "20, false, 0", "20, true, 90"})
    void calculaElCosto(int peso, boolean express, int esperado) {
        assertThat(CalculadoraEnvio.costo(peso, express)).isEqualTo(esperado);
    }

    @Test
    void pesoCeroEsInvalido() {
        assertThatThrownBy(() -> CalculadoraEnvio.costo(0, false)).isInstanceOf(IllegalArgumentException.class);
    }
}
