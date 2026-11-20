// M0 · Tema 7 · primeras pruebas de rutaflow-nucleo. Ejecuta: ./gradlew test
package rutaflow.nucleo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class TarifaTest {
    @Test
    void unKiloExactoPagaBaseMasUnKilo() {
        assertEquals(7800, Tarifa.costoEnPesos(1000));
    }

    @Test
    void unKiloEmpezadoSeCobraEntero() {
        assertEquals(9600, Tarifa.costoEnPesos(1001));
    }

    @Test
    void elPesoDebeSerPositivo() {
        assertThrows(IllegalArgumentException.class, () -> Tarifa.costoEnPesos(0));
    }
}
