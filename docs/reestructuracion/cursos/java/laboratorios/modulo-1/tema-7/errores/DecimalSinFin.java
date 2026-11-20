// Compila, pero falla al ejecutar: 10 / 3 no tiene representación decimal exacta.
import java.math.BigDecimal;

public class DecimalSinFin {
    public static void main(String[] args) {
        BigDecimal total = new BigDecimal("10");
        System.out.println(total.divide(new BigDecimal("3")));
    }
}
