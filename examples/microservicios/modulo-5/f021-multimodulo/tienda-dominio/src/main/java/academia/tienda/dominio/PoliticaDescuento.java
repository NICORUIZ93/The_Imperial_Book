package academia.tienda.dominio;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Regla de negocio pura: 10 % de descuento desde 200 000, 5 % desde 100 000. */
public final class PoliticaDescuento {

    private static final BigDecimal CIEN_MIL = new BigDecimal("100000");
    private static final BigDecimal DOSCIENTOS_MIL = new BigDecimal("200000");

    public BigDecimal descuento(BigDecimal total) {
        if (total.signum() < 0) {
            throw new IllegalArgumentException("total negativo: " + total);
        }
        BigDecimal tasa = total.compareTo(DOSCIENTOS_MIL) >= 0 ? new BigDecimal("0.10")
            : total.compareTo(CIEN_MIL) >= 0 ? new BigDecimal("0.05")
            : BigDecimal.ZERO;
        return total.multiply(tasa).setScale(0, RoundingMode.HALF_UP);
    }
}
