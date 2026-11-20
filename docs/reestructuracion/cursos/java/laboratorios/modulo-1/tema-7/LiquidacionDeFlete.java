// M1 · Tema 7 · ejemplo realista: liquidar un flete con BigDecimal y contar combinaciones con BigInteger.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 LiquidacionDeFlete.java
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;

public class LiquidacionDeFlete {
    public static void main(String[] args) {
        // Se construye desde texto: desde un double se hereda su error.
        System.out.println("new BigDecimal(0.1)   = " + new BigDecimal(0.1));
        System.out.println("new BigDecimal(\"0.1\") = " + new BigDecimal("0.1"));
        System.out.println("0.1 + 0.2             = " + new BigDecimal("0.1").add(new BigDecimal("0.2")));

        BigDecimal flete = new BigDecimal("11500.00");
        BigDecimal tasaIva = new BigDecimal("0.19");
        BigDecimal iva = flete.multiply(tasaIva).setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal total = flete.add(iva);     // BigDecimal es inmutable: add devuelve un objeto nuevo
        System.out.println("flete " + flete + " + IVA " + iva + " = " + total);

        // Repartir entre 3: sin escala y redondeo no hay resultado exacto.
        BigDecimal tres = new BigDecimal("3");
        try {
            total.divide(tres);
        } catch (ArithmeticException e) {
            System.out.println("divide sin redondeo: " + e.getMessage());
        }
        BigDecimal cuota = total.divide(tres, 2, RoundingMode.HALF_EVEN);
        System.out.println("cuota: " + cuota + " · 3 cuotas: " + cuota.multiply(tres)
                + " · falta por repartir: " + total.subtract(cuota.multiply(tres)));

        // equals compara también la escala; compareTo compara el valor.
        BigDecimal a = new BigDecimal("2.0");
        BigDecimal b = new BigDecimal("2.00");
        System.out.println("2.0 equals 2.00 ? " + a.equals(b) + " · compareTo: " + a.compareTo(b));

        // Redondeo del banquero frente al de la escuela.
        System.out.println("2.5 → HALF_EVEN " + new BigDecimal("2.5").setScale(0, RoundingMode.HALF_EVEN)
                + " · HALF_UP " + new BigDecimal("2.5").setScale(0, RoundingMode.HALF_UP)
                + " · 3.5 → HALF_EVEN " + new BigDecimal("3.5").setScale(0, RoundingMode.HALF_EVEN));

        // BigInteger: enteros sin límite. Órdenes posibles de visitar 25 paradas: 25!
        BigInteger ordenes = BigInteger.ONE;
        for (int parada = 2; parada <= 25; parada++) {
            ordenes = ordenes.multiply(BigInteger.valueOf(parada));
        }
        System.out.println("25! = " + ordenes + " (" + ordenes.bitLength() + " bits; long tiene 63 útiles)");
        long enLong = 1;
        for (int parada = 2; parada <= 25; parada++) {
            enLong *= parada;
        }
        System.out.println("25! en long = " + enLong + " (desbordado en silencio)");
    }
}
