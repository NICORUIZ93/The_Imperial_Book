// M1 · Tema 6 · nivel maestro: == entre double es la instrucción dcmpl; con NaN siempre da «distinto».
// Mira: javac -d out Fp.java && javap -c -cp out Fp
public class Fp {
    static boolean igual(double a, double b) {
        return a == b;
    }

    static double suma(double a, double b) {
        return a + b;
    }
}
