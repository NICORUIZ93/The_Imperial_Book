// M4 · Tema 6 · Tres fallos que NO lanzan excepcion: se ven en el resultado, o no se ven nunca.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out OrdenRoto
import java.util.Arrays;

public class OrdenRoto {

    // 1) Intercambio sin variable temporal: el segundo paso lee lo que el primero ya pisoteo.
    static void intercambioRoto(int[] v, int i, int j) {
        v[i] = v[j];
        v[j] = v[i];                    // mal: v[i] ya vale v[j], así que no se recupera nada
    }

    static void intercambioBien(int[] v, int i, int j) {
        int temporal = v[i];
        v[i] = v[j];
        v[j] = temporal;
    }

    // 2) (bajo + alto) / 2 se desborda con indices grandes; la resta por el medio no.
    static int puntoMedioPeligroso(int bajo, int alto) {
        return (bajo + alto) / 2;
    }

    static int puntoMedioSeguro(int bajo, int alto) {
        return bajo + (alto - bajo) / 2;
    }

    // 3) Insertar sin devolver el valor guardado: el elemento se duplica y el otro desaparece.
    static void insercionSinRescate(int[] v) {
        for (int i = 1; i < v.length; i++) {
            int j = i - 1;
            while (j >= 0 && v[j] > v[i]) {
                v[j + 1] = v[j];
                j--;
            }
            // falta: v[j + 1] = valor;
        }
    }

    public static void main(String[] args) {
        int[] roto = {1250, 3400, 890};
        intercambioRoto(roto, 0, 1);
        System.out.println("intercambio roto  : " + Arrays.toString(roto) + " · perdió el 1250");

        int[] bien = {1250, 3400, 890};
        intercambioBien(bien, 0, 1);
        System.out.println("intercambio bien  : " + Arrays.toString(bien));

        int grande1 = Integer.MAX_VALUE - 1, grande2 = Integer.MAX_VALUE;
        System.out.println("medio peligroso   : " + puntoMedioPeligroso(grande1, grande2));
        System.out.println("medio seguro      : " + puntoMedioSeguro(grande1, grande2));

        int[] sinRescate = {7600, 250, 1250};
        insercionSinRescate(sinRescate);
        System.out.println("sin rescatar      : " + Arrays.toString(sinRescate)
                + " · esperado [250, 1250, 7600]");

        int[] rescatado = {7600, 250, 1250};
        Arrays.sort(rescatado);
        System.out.println("con Arrays.sort   : " + Arrays.toString(rescatado));
    }
}
