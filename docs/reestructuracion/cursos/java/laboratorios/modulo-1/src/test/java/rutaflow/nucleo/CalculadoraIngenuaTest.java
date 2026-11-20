// M1 · laboratorio · estas pruebas PASAN y documentan el número equivocado que da cada fallo.
package rutaflow.nucleo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class CalculadoraIngenuaTest {
    @Test
    void laCargaSeDesbordaEnSilencio() {
        assertEquals(-1_294_967_296L, CalculadoraIngenua.cargaTotalGramos(1_500, 2_000_000));
    }

    @Test
    void losKilosPierdenLosDecimales() {
        assertEquals(2.0, CalculadoraIngenua.kilos(2500));
    }

    @Test
    void laTarifaSeTruncaEnVezDeRedondear() {
        assertEquals(11_399, CalculadoraIngenua.tarifaEnPesos(11_399.6));
    }

    @Test
    void elRecargoEnDoubleNoDaElNumeroExacto() {
        assertNotEquals(100_000.0, CalculadoraIngenua.recargoAcumulado(1_000_000));
    }
}
