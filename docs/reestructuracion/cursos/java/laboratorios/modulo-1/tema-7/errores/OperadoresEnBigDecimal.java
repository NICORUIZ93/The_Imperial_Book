// No compila: los operadores aritméticos no funcionan con objetos BigDecimal.
import java.math.BigDecimal;

public class OperadoresEnBigDecimal {
    public static void main(String[] args) {
        BigDecimal flete = new BigDecimal("11400.00");
        BigDecimal iva = flete * 0.19;
    }
}
