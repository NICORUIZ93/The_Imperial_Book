// M1 · Tema 6 · ejemplo mínimo: lo que double puede y no puede representar.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 PuntoFlotante.java
import java.math.BigDecimal;

public class PuntoFlotante {
    public static void main(String[] args) {
        System.out.println("0.1 + 0.2 = " + (0.1 + 0.2) + " · ¿== 0.3? " + (0.1 + 0.2 == 0.3));
        System.out.println("0.5 + 0.25 = " + (0.5 + 0.25) + " · ¿== 0.75? " + (0.5 + 0.25 == 0.75));

        // El valor que de verdad se guarda cuando escribes 0.1:
        System.out.println("0.1 exacto = " + new BigDecimal(0.1));
        System.out.println("bits de 0.1 = 0x" + Long.toHexString(Double.doubleToLongBits(0.1)));
        System.out.println("0.1f == 0.1 ? " + (0.1f == 0.1) + " · (double) 0.1f = " + (double) 0.1f);

        // Valores especiales: no hay excepción al dividir entre cero en punto flotante.
        double infinito = 1 / 0.0;
        double nan = 0 / 0.0;
        System.out.println("1/0.0 = " + infinito + " · -1/0.0 = " + (-1 / 0.0) + " · 0/0.0 = " + nan);
        System.out.println("NaN == NaN ? " + (nan == nan) + " · Double.isNaN: " + Double.isNaN(nan)
                + " · NaN > 1 ? " + (nan > 1) + " · NaN < 1 ? " + (nan < 1));
        System.out.println("0.0 == -0.0 ? " + (0.0 == -0.0) + " · Double.compare: " + Double.compare(0.0, -0.0)
                + " · 1/-0.0 = " + (1 / -0.0));

        // La separación entre números representables crece con la magnitud.
        System.out.println("ulp(1.0) = " + Math.ulp(1.0) + " · ulp(1e16) = " + Math.ulp(1e16));
        System.out.println("1e16 + 1 == 1e16 ? " + (1e16 + 1 == 1e16));
        System.out.println("MAX_VALUE * 2 = " + Double.MAX_VALUE * 2 + " · MIN_VALUE / 2 = " + Double.MIN_VALUE / 2);

        // Comparar con tolerancia en vez de ==.
        double tolerancia = 1e-9;
        System.out.println("|0.1 + 0.2 - 0.3| < 1e-9 ? " + (Math.abs(0.1 + 0.2 - 0.3) < tolerancia));
    }
}
