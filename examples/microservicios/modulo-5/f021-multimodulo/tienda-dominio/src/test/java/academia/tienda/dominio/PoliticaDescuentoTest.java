package academia.tienda.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class PoliticaDescuentoTest {

    @ParameterizedTest
    @CsvSource({"50000,0", "100000,5000", "250000,25000"})
    void aplicaElTramoCorrecto(String total, String esperado) {
        assertEquals(new BigDecimal(esperado), new PoliticaDescuento().descuento(new BigDecimal(total)));
    }
}
