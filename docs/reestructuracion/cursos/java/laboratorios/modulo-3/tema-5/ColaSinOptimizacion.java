// M3 · Tema 5 · la recursion de cola NO se optimiza en Java: el desbordamiento llega igual.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Xss256k -cp out ColaSinOptimizacion
// Si la JVM hiciera eliminacion de recursion de cola, el acumulador bastaria y esto no se cae.
public class ColaSinOptimizacion {
    static long sumaDeCola(int i, long acumulado) {
        if (i >= 1_000_000) return acumulado;
        return sumaDeCola(i + 1, acumulado + i);   // la llamada es lo ultimo: recursion de cola real
    }

    static int marcos = 0;
    static void hondoConCola() {
        marcos++;
        hondoConCola();                             // ni un solo calculo despues de la llamada
    }

    public static void main(String[] args) {
        try {
            System.out.println("sumaDeCola hasta 1.000.000: " + sumaDeCola(0, 0L));
        } catch (StackOverflowError e) {
            System.out.println("sumaDeCola desbordo; la traza trae " + marcosDe(e) + " marcos");
        }
        marcos = 0;
        try {
            hondoConCola();
        } catch (StackOverflowError e) {
            System.out.println("hondoConCola llamo " + marcos + " veces antes de desbordar");
        }
    }

    static int marcosDe(StackOverflowError e) { return e.getStackTrace().length; }
}
