// M4 · Tema 6 · Por dentro · Cuantas instrucciones cuesta un intercambio y de donde sale el limite del bucle.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out CosteEnBytecode
// Y miralo: javac -d out2 CosteEnBytecode.java && javap -c -p -cp out2 CosteEnBytecode
import java.util.Arrays;

public class CosteEnBytecode {

    // Tres lineas de intercambio = CUATRO accesos al arreglo en bytecode: 2 iaload + 2 iastore.
    static void intercambioDeTresPaso(int[] v, int i, int j) {
        int temporal = v[i];
        v[i] = v[j];
        v[j] = temporal;
    }

    // v.length dentro de la condicion sale como arraylength DENTRO del bucle: se ejecuta cada vuelta.
    static long sumaVista(int[] v) {
        long s = 0;
        for (int i = 0; i < v.length; i++) {
            s += v[i];
        }
        return s;
    }

    // Guardado en una local, el arraylength queda FUERA del bucle: una ejecucion menos por vuelta.
    static long sumaGuardada(int[] v) {
        long s = 0;
        int n = v.length;
        for (int i = 0; i < n; i++) {
            s += v[i];
        }
        return s;
    }

    public static void main(String[] args) {
        int[] pesos = {7600, 250, 1250};
        intercambioDeTresPaso(pesos, 0, 2);
        System.out.println("intercambio        : " + Arrays.toString(pesos));
        System.out.println("sumaVista/sumaGuardada: " + sumaVista(pesos) + " / " + sumaGuardada(pesos));
    }
}
