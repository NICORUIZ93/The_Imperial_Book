// M4 · Tema 5 · La cache de Integer.valueOf: hasta que numero las cajas son el mismo objeto.
// Java 25. Ejecuta (valores por defecto):
//   javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out CacheDeInteger
// Y con la cache agrandada, para ver que el corte es una propiedad de la JVM y no del lenguaje:
//   java -Djava.lang.Integer.IntegerCache.high=5000 -Dstdout.encoding=UTF-8 -cp out CacheDeInteger
public class CacheDeInteger {

    // Primer valor POR ARRIBA donde valueOf ya no devuelve la misma caja.
    static int corteArriba() {
        for (int v = 100; v < 100000; v++) {
            if (Integer.valueOf(v) != Integer.valueOf(v)) {
                return v;
            }
        }
        return -1;
    }

    // Primer valor POR ABAJO donde deja de ser la misma caja: bajando desde -100, es el -129.
    static int fueraPorAbajo() {
        for (int v = -100; v > -1000; v--) {
            if (Integer.valueOf(v) != Integer.valueOf(v)) {
                return v;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        // La propiedad se la pasa a la JVM al arrancar; leida desde Java ya no esta, y eso NO significa
        // que no haya hecho efecto: mira "corte por arriba" en las dos corridas.
        System.out.println("propiedad visible      : " + System.getProperty("java.lang.Integer.IntegerCache.high"));
        System.out.println("valueOf(127) misma caja : " + (Integer.valueOf(127) == Integer.valueOf(127)));
        System.out.println("valueOf(128) misma caja : " + (Integer.valueOf(128) == Integer.valueOf(128)));
        System.out.println("primer 128 de mas       : " + Integer.valueOf(128) + " y el otro " + Integer.valueOf(128));
        System.out.println("corte por arriba        : " + corteArriba() + " (el primero que ya no)");
        System.out.println("corte por abajo         : " + fueraPorAbajo() + " (el primero que ya no)");
        System.out.println("equals no lo nota       : " + Integer.valueOf(128).equals(Integer.valueOf(128))
                + " · compareTo " + Integer.valueOf(128).compareTo(Integer.valueOf(128)));

        // Autoboxing usa valueOf, por eso HEREDA la cache: con 127 los == valen, con 128 no.
        Integer x = 127, y = 127;
        Integer p = 128, q = 128;
        System.out.println("autoboxing 127 == 127   : " + (x == y));
        System.out.println("autoboxing 128 == 128   : " + (p == q));

        // Las demas cajas tambien tienen su rincon de objetos compartidos, con otros limites.
        System.out.println("Long        -128/127    : " + (Long.valueOf(-128) == Long.valueOf(-128))
                + " / " + (Long.valueOf(127) == Long.valueOf(127)) + " · 128: " + (Long.valueOf(128) == Long.valueOf(128)));
        System.out.println("Short       -128/127    : " + (Short.valueOf((short) -128) == Short.valueOf((short) -128))
                + " / " + (Short.valueOf((short) 127) == Short.valueOf((short) 127))
                + " · 128: " + (Short.valueOf((short) 128) == Short.valueOf((short) 128)));
        System.out.println("Character        0/127  : " + (Character.valueOf((char) 0) == Character.valueOf((char) 0))
                + " / " + (Character.valueOf((char) 127) == Character.valueOf((char) 127))
                + " · 128: " + (Character.valueOf((char) 128) == Character.valueOf((char) 128)));
        System.out.println("Byte   toda la gama     : " + (Byte.valueOf((byte) -128) == Byte.valueOf((byte) -128))
                + " y " + (Byte.valueOf((byte) 127) == Byte.valueOf((byte) 127)));
        System.out.println("Boolean constantes      : " + (Boolean.TRUE == Boolean.valueOf(true))
                + " · Double NO tiene cache: " + (Double.valueOf(1.0) == Double.valueOf(1.0)));
    }
}
