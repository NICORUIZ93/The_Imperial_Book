// M4 · Tema 6 · Busqueda lineal, binaria y dos ordenaciones escritas a mano, con sus comparaciones contadas.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out BuscarYOrdenarAMano
import java.util.Arrays;

public class BuscarYOrdenarAMano {

    // Lineal: mira uno por uno. El PEOR caso es n comparaciones.
    static int lineal(int[] v, int objetivo, int[] contadas) {
        contadas[0] = 0;
        for (int i = 0; i < v.length; i++) {
            contadas[0]++;
            if (v[i] == objetivo) {
                return i;
            }
        }
        return -1;
    }

    // Binaria: divide por la mitad. Requiere el arreglo ORDENADO.
    static int binaria(int[] v, int objetivo, int[] contadas) {
        contadas[0] = 0;
        int bajo = 0, alto = v.length - 1;
        while (bajo <= alto) {
            contadas[0]++;
            int medio = bajo + (alto - bajo) / 2;       // asi se evita el desbordamiento de (bajo+alto)/2
            if (v[medio] == objetivo) {
                return medio;
            } else if (v[medio] < objetivo) {
                bajo = medio + 1;
            } else {
                alto = medio - 1;
            }
        }
        return -1;
    }

    // Insercion: mete cada elemento en su lugar. Barato en casi-ordenado, caro en invertido.
    static void insercion(int[] v, int[] contadas) {
        int c = 0;
        for (int i = 1; i < v.length; i++) {
            int valor = v[i];
            int j = i - 1;
            while (j >= 0) {
                c++;
                if (v[j] > valor) {
                    v[j + 1] = v[j];
                    j--;
                } else {
                    break;
                }
            }
            v[j + 1] = valor;
        }
        contadas[0] = c;
    }

    // Burbuja: va intercambiando vecinos. Mas comparaciones que insercion en el mismo dato.
    static void burbuja(int[] v, int[] contadas) {
        int c = 0;
        for (int i = v.length - 1; i > 0; i--) {
            for (int j = 0; j < i; j++) {
                c++;
                if (v[j] > v[j + 1]) {
                    int temporal = v[j];
                    v[j] = v[j + 1];
                    v[j + 1] = temporal;
                }
            }
        }
        contadas[0] = c;
    }

    public static void main(String[] args) {
        int[] llegada = {7600, 250, 1250, 890, 3400, 45, 18000};
        int[] contadas = new int[1];

        System.out.println("arreglo    : " + Arrays.toString(llegada));
        System.out.println("lineal 890 : indice " + lineal(llegada, 890, contadas) + " · comparaciones " + contadas[0]);
        System.out.println("lineal 999 : indice " + lineal(llegada, 999, contadas) + " · comparaciones " + contadas[0]
                + " (repaso los " + llegada.length + " porque no estaba)");

        int[] ordenado = llegada.clone();
        Arrays.sort(ordenado);
        System.out.println("ordenado   : " + Arrays.toString(ordenado));
        System.out.println("binaria 890: indice " + binaria(ordenado, 890, contadas) + " · comparaciones " + contadas[0]);
        System.out.println("binaria 999: indice " + binaria(ordenado, 999, contadas) + " · comparaciones " + contadas[0]);
        System.out.println("mismo resultado que Arrays.binarySearch: "
                + (binaria(ordenado, 890, contadas) == Arrays.binarySearch(ordenado, 890)));

        int[] copia = llegada.clone();
        insercion(copia, contadas);
        System.out.println("insercion  : " + Arrays.toString(copia) + " · comparaciones " + contadas[0]);
        copia = llegada.clone();
        burbuja(copia, contadas);
        System.out.println("burbuja    : " + Arrays.toString(copia) + " · comparaciones " + contadas[0]);
    }
}
