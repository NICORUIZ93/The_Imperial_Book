// M1 · Tema 1 · nivel maestro: cada tamaño de literal usa una instrucción distinta de bytecode.
// Mira: javac -d out Constantes.java && javap -c -cp out Constantes
public class Constantes {
    static long medir() {
        int a = 5;
        int b = 100;
        int c = 30_000;
        int d = 100_000;
        long e = 3_000_000_000L;
        double f = 2.5;
        boolean g = true;
        char h = 'A';
        return a + b + c + d + e;
    }
}
