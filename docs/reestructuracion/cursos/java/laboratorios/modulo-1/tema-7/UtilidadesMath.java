// M1 · Tema 7 · ejemplo mínimo: Math para redondear, dividir y acotar sin sorpresas.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 UtilidadesMath.java
public class UtilidadesMath {
    public static void main(String[] args) {
        System.out.println("round(2.5) = " + Math.round(2.5) + " · round(-2.5) = " + Math.round(-2.5)
                + " · rint(2.5) = " + Math.rint(2.5) + " · rint(3.5) = " + Math.rint(3.5));
        System.out.println("floor(-2.1) = " + Math.floor(-2.1) + " · ceil(-2.1) = " + Math.ceil(-2.1)
                + " · (int) -2.1 = " + (int) -2.1);

        // Kilos empezados: tres formas de la misma cuenta.
        int gramos = 2500;
        System.out.println("kilos empezados: " + (gramos + 999) / 1000 + " · " + Math.ceilDiv(gramos, 1000)
                + " · " + (int) Math.ceil(gramos / 1000.0));

        // % conserva el signo del dividendo; floorMod siempre cae en el rango del divisor.
        System.out.println("-7 % 5 = " + (-7 % 5) + " · floorMod(-7, 5) = " + Math.floorMod(-7, 5)
                + " · -7 / 5 = " + (-7 / 5) + " · floorDiv(-7, 5) = " + Math.floorDiv(-7, 5));

        System.out.println("clamp(31000, 0, 30000) = " + Math.clamp(31_000, 0, 30_000)
                + " · max(1200, 1800) = " + Math.max(1200, 1800));
        System.out.println("sqrt(2) = " + Math.sqrt(2) + " · pow(2, 10) = " + Math.pow(2, 10)
                + " · hypot(3, 4) = " + Math.hypot(3, 4));

        // Una trampa de borde: el valor absoluto del mínimo no cabe.
        System.out.println("abs(Integer.MIN_VALUE) = " + Math.abs(Integer.MIN_VALUE));
        try {
            Math.absExact(Integer.MIN_VALUE);
        } catch (ArithmeticException e) {
            System.out.println("absExact dice: " + e.getMessage());
        }
    }
}
