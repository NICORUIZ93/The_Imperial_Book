// M3 · Tema 5 · por dentro: una llamada recursiva es un invokestatic normal y corriente.
// Java 25. Ejecuta: javac --release 25 -d out Recursividad.java
//                  javap -c -p -cp out Recursividad
// Medido aqui: en el bytecode no hay ninguna marca de «esto es recursion»: la llamada apunta al
// propio metodo. Y la recursion de cola (factorialDeCola) tampoco se convierte en bucle: sigue
// teniendo su invokestatic, porque javac no hace eliminacion de recursion de cola.
public class Recursividad {
    static int idaYVuelta(int n) {                 // no es de cola: hay una suma despues del return
        if (n <= 1) return 1;
        return n * idaYVuelta(n - 1);
    }
    static long factorialDeCola(long n, long acc) { // si es de cola: la llamada es lo ultimo
        if (n <= 1) return acc;
        return factorialDeCola(n - 1, n * acc);
    }
    static int enBucle(int n) {                     // la misma cuenta, sin marcos de por medio
        long r = 1;
        for (int i = 2; i <= n; i++) r *= i;
        return (int) r;
    }
    public static void main(String[] args) {
        System.out.println("idaYVuelta(10)      = " + idaYVuelta(10));
        System.out.println("factorialDeCola(10) = " + factorialDeCola(10, 1));
        System.out.println("enBucle(10)         = " + enBucle(10));
    }
}
