// M1 · Tema 3 · nivel maestro: una final con valor constante desaparece: el compilador pone el número.
public class ConFinal {
    static int f() {
        int peso = 2500;
        final int tope = 30_000;
        return peso + tope;
    }
}
