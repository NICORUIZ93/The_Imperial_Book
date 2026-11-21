// M4 · Tema 6 · Coste medido contando comparaciones, no cronometrando: los numeros son exactos.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Crecimiento
public class Crecimiento {

    static long comparacionesLineal(int n) {                 // peor caso: el objetivo no esta
        return n;
    }

    static long comparacionesBinaria(int n) {                // peor caso: hasta que bajo > alto
        int bajo = 0, alto = n - 1, c = 0;
        while (bajo <= alto) {
            int medio = bajo + (alto - bajo) / 2;
            c++;
            if (medio == n) {
                break;
            }
            bajo = medio + 1;                                // camina siempre a la derecha: peor recorrido
        }
        return c;
    }

    static long[] insercion(int[] v) {
        long comparaciones = 0;
        for (int i = 1; i < v.length; i++) {
            int valor = v[i];
            int j = i - 1;
            while (j >= 0) {
                comparaciones++;
                if (v[j] > valor) {
                    v[j + 1] = v[j];
                    j--;
                } else {
                    break;
                }
            }
            v[j + 1] = valor;
        }
        return new long[] {comparaciones};
    }

    static long[] burbuja(int[] v) {
        long comparaciones = 0;
        for (int i = v.length - 1; i > 0; i--) {
            for (int j = 0; j < i; j++) {
                comparaciones++;
                if (v[j] > v[j + 1]) {
                    int t = v[j];
                    v[j] = v[j + 1];
                    v[j + 1] = t;
                }
            }
        }
        return new long[] {comparaciones};
    }

    static int[] invertido(int n) {
        int[] v = new int[n];
        for (int i = 0; i < n; i++) {
            v[i] = n - i;
        }
        return v;
    }

    static int[] casiOrdenado(int n) {                       // ordenado, salvo el ultimo que va al principio
        int[] v = new int[n];
        for (int i = 0; i < n; i++) {
            v[i] = i;
        }
        int ultimo = v[n - 1];
        System.arraycopy(v, 0, v, 1, n - 1);
        v[0] = ultimo;
        return v;
    }

    public static void main(String[] args) {
        System.out.println("n      lineal  binaria   n*(n-1)/2");
        for (int n : new int[] {1000, 2000, 4000, 8000}) {
            System.out.println(String.format("%-6d %-7d %-8d %d", n, comparacionesLineal(n),
                    comparacionesBinaria(n), (long) n * (n - 1) / 2));
        }

        System.out.println("binaria: al duplicar n solo suma 1 comparacion (8 -> 1000, 16 -> 2000)");

        // Sobre el MISMO dato, la diferencia entre las dos cuadratricas aparece cuando casi esta ordenado.
        int[] a = invertido(8000);
        long cInv = insercion(a)[0];
        int[] b = invertido(8000);
        long cBub = burbuja(b)[0];
        System.out.println("invertido 8000   : insercion " + cInv + " · burbuja " + cBub);

        int[] c = casiOrdenado(8000);
        long cCas = insercion(c)[0];
        int[] d = casiOrdenado(8000);
        long dBub = burbuja(d)[0];
        System.out.println("casi ordenado 8000: insercion " + cCas + " · burbuja " + dBub);
        System.out.println("  ratio burbuja/insercion en casi ordenado: " + (dBub / cCas));

        // Y el contador tiene su propio riesgo: n*(n-1)/2 en INT se desborda mucho antes de lo que crees.
        int nGrande = 100000;
        long bien = (long) nGrande * (nGrande - 1) / 2;
        int mal = nGrande * (nGrande - 1) / 2;
        System.out.println("100000*(99999)/2 : long " + bien + " · int " + mal);
    }
}
