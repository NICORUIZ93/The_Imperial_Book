// M4 · Tema 4 · Por dentro · for-each sobre una lista ES un iterador; con indice son llamadas a get.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out RecorridoEnBytecode
// Y miralo: javac -d out2 RecorridoEnBytecode.java && javap -c -p -cp out2 RecorridoEnBytecode
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.RandomAccess;

public class RecorridoEnBytecode {

    static long conIndice(List<Integer> pesos) {
        long s = 0;
        for (int i = 0; i < pesos.size(); i++) {
            s += pesos.get(i);                     // invokeinterface List.get:(I) + desempaquetar
        }
        return s;
    }

    static long conForEach(List<Integer> pesos) {
        long s = 0;
        for (int p : pesos) {                      // invokeinterface List.iterator:() + hasNext/next
            s += p;
        }
        return s;
    }

    static int escribeConIterator(List<String> guias) {
        Iterator<String> it = guias.iterator();
        int n = 0;
        while (it.hasNext()) {
            it.next();
            n++;
        }
        return n;
    }

    public static void main(String[] args) {
        List<Integer> pesos = new ArrayList<>(List.of(1250, 3400, 890));
        List<String> guias = new ArrayList<>(List.of("RF-000123", "RF-000124"));

        System.out.println("conIndice / conForEach : " + conIndice(pesos) + " / " + conForEach(pesos));
        System.out.println("con iterator           : " + escribeConIterator(guias) + " vueltas");

        // RandomAccess es una MARCA vacia: no aporta metodos, solo informa al codigo que sabe mirar.
        System.out.println("ArrayList es RandomAccess : " + (pesos instanceof RandomAccess));
        System.out.println("LinkedList es RandomAccess: "
                + (new java.util.LinkedList<Integer>() instanceof RandomAccess));

        // Un arreglo tiene length como campo; una lista tiene size() como metodo. No son intercambiables.
        int[] arreglo = {1, 2, 3};
        System.out.println("arreglo.length / lista.size(): " + arreglo.length + " / " + pesos.size());

        // equals entre listas compara ELEMENTOS; entre listas y arreglos siempre es false.
        List<Integer> gemela = new ArrayList<>(List.of(1250, 3400, 890));
        System.out.println("equals de listas          : " + pesos.equals(gemela)
                + " · lista.equals(arreglo): " + pesos.equals(arreglo));
    }
}
