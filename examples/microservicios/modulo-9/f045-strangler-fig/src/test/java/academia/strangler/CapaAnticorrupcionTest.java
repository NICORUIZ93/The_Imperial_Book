package academia.strangler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CapaAnticorrupcionTest {

    @Test
    void traduceElRegistroHeredadoAlModeloNuevo() {
        var tarifa = CapaAnticorrupcion.traducir("COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S");
        assertEquals(new CapaAnticorrupcion.Tarifa(CapaAnticorrupcion.Zona.METROPOLITANA,
                new BigDecimal("1250.50"), 5000), tarifa);
    }

    @Test
    void unaZonaDesconocidaSeDetieneEnLaFrontera() {
        var e = assertThrows(CapaAnticorrupcion.RegistroHeredadoInvalido.class,
                () -> CapaAnticorrupcion.traducir("COD_ZONA=Z09|TARIFA_X_KG=1,0|BASE=1|IND_ACTIVO=S"));
        assertEquals("zona heredada desconocida: Z09", e.getMessage());
    }
}
