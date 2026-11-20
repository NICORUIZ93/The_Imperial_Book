package academia.nativo;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Nadie hace "new CalculadoraIva()": se crea por reflexión a partir de una propiedad. */
public class CalculadoraIva implements Calculadora {
    public CalculadoraIva() { }

    @Override
    public BigDecimal impuesto(BigDecimal base) {
        return base.multiply(new BigDecimal("0.19")).setScale(0, RoundingMode.HALF_UP);
    }
}
