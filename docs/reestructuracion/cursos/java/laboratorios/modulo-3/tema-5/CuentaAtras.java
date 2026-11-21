// M3 · Tema 5 · recursion: cada llamada ocupa un marco de pila, y el orden del trabajo depende
// de si se hace en el camino de ida o en el de vuelta.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out CuentaAtras
public class CuentaAtras {
    static final int[] TANDA = {1250, 3400, 890};

    // Imprime al DESMONTAR el marco: la ultima llamada en llegar es la primera en imprimir.
    static void reparte(int i) {
        if (i >= TANDA.length) return;
        reparte(i + 1);
        System.out.println("  suelta " + TANDA[i] + " g");
    }

    // Imprime al MONTAR el marco: se imprime en el orden de llegada.
    static void recoge(int i) {
        if (i >= TANDA.length) return;
        System.out.println("  recoge " + TANDA[i] + " g");
        recoge(i + 1);
    }

    static long suma(int i) {
        if (i >= TANDA.length) return 0;
        return TANDA[i] + suma(i + 1);
    }

    // Cuantos marcos estan vivos en el momento mas hondo: se mide lanzando y capturando.
    static int marcosVivos(int i) {
        if (i >= TANDA.length) {
            StackTraceElement[] pila = new Exception().getStackTrace();
            return pila.length;
        }
        return marcosVivos(i + 1);
    }

    // Los mismos marcos, pero uno por linea. Se ven dos cosas que el numero solo no dice:
    // que el mas nuevo es el que esta en el caso base, y que el ultimo de la torre siempre es main.
    static void marcoVivo(int i) {
        if (i >= TANDA.length) {
            for (StackTraceElement m : new Exception().getStackTrace()) System.out.println("  " + m);
            return;
        }
        marcoVivo(i + 1);
    }

    public static void main(String[] args) {
        System.out.println("recoge (trabajo en el camino de ida):");
        recoge(0);
        System.out.println("reparte (trabajo en el camino de vuelta):");
        reparte(0);
        System.out.println("suma recursiva: " + suma(0));
        System.out.println("marcos vivos en el fondo para 3 envios: " + marcosVivos(0));
        System.out.println("los mismos marcos, del mas nuevo al mas viejo:");
        marcoVivo(0);
    }
}
