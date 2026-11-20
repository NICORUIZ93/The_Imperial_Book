// M1 · laboratorio · las mismas cuentas, ahora con el resultado correcto.
package rutaflow.nucleo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CalculadoraDeTarifasTest {
    @Test
    void laCargaCabeEnLong() {
        assertEquals(3_000_000_000L, CalculadoraDeTarifas.cargaTotalGramos(1_500, 2_000_000));
    }

    @Test
    void losKilosConservanLosDecimales() {
        assertEquals(2.5, CalculadoraDeTarifas.kilos(2500));
    }

    @Test
    void laTarifaSeRedondeaAlMasCercano() {
        assertEquals(11_400, CalculadoraDeTarifas.tarifaEnPesos(11_399.6));
    }

    @Test
    void unaTarifaQueNoCabeEnIntFallaEnVezDeRecortarse() {
        assertThrows(ArithmeticException.class, () -> CalculadoraDeTarifas.tarifaEnPesos(3e9));
    }

    @Test
    void elRecargoEnCentavosEsExacto() {
        assertEquals(10_000_000L, CalculadoraDeTarifas.recargoAcumuladoEnCentavos(1_000_000));
    }

    @Test
    void seCobraElKiloEmpezado() {
        assertEquals(7_800, CalculadoraDeTarifas.costoEnPesos(1_000));
        assertEquals(9_600, CalculadoraDeTarifas.costoEnPesos(1_001));
        assertEquals(11_400, CalculadoraDeTarifas.costoEnPesos(2_500));
    }

    @Test
    void elIvaSeRedondeaADosDecimales() {
        assertEquals(new BigDecimal("13566.00"), CalculadoraDeTarifas.totalConIva(11_400));
    }
}
