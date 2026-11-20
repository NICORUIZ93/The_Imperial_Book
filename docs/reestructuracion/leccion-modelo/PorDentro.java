// Lección modelo · nivel maestro: en qué cubeta cae una clave y cuánto cuesta un mal hashCode.
// Java 25. Ejecuta: java PorDentro.java
import java.util.HashMap;
import java.util.Map;

public class PorDentro {
    // La misma cuenta que hace HashMap: mezcla los bits altos y se queda con los bajos.
    static int cubeta(Object clave, int capacidad) {
        int h = clave.hashCode();
        return (h ^ (h >>> 16)) & (capacidad - 1);
    }

    record ClaveBuena(int id) {}

    // hashCode legal pero pésimo: todas las claves caen en la misma cubeta.
    record ClaveMala(int id) {
        @Override public int hashCode() { return 42; }
    }

    // El mismo hashCode constante, pero la clave se puede ordenar: el mapa convierte la cubeta en árbol.
    record ClaveMalaOrdenable(int id) implements Comparable<ClaveMalaOrdenable> {
        @Override public int hashCode() { return 42; }
        @Override public int compareTo(ClaveMalaOrdenable o) { return Integer.compare(id, o.id); }
    }

    static long medir(Map<Object, Integer> mapa, java.util.function.IntFunction<Object> fabrica, int n) {
        long inicio = System.nanoTime();
        for (int i = 0; i < n; i++) mapa.put(fabrica.apply(i), i);
        long suma = 0;
        for (int i = 0; i < n; i++) suma += mapa.get(fabrica.apply(i));
        if (suma != (long) n * (n - 1) / 2) throw new IllegalStateException("resultado incorrecto");
        return (System.nanoTime() - inicio) / 1_000_000;
    }

    public static void main(String[] args) {
        System.out.println("\"Aa\".hashCode() = " + "Aa".hashCode() + " · \"BB\".hashCode() = " + "BB".hashCode());
        for (String s : new String[] {"Aa", "BB", "TEC-1", "TEC-2"})
            System.out.println("  cubeta de " + s + " con capacidad 16: " + cubeta(s, 16));

        int n = 20_000;
        medir(new HashMap<>(), ClaveBuena::new, n);   // calentamiento del JIT
        long buena = medir(new HashMap<>(), ClaveBuena::new, n);
        long mala = medir(new HashMap<>(), ClaveMala::new, n);
        System.out.println(n + " put + " + n + " get con hashCode bueno: " + buena + " ms");
        long ordenable = medir(new HashMap<>(), ClaveMalaOrdenable::new, n);
        System.out.println(n + " put + " + n + " get con hashCode constante: " + mala + " ms");
        System.out.println(n + " put + " + n + " get con hashCode constante y Comparable: " + ordenable + " ms");
    }
}
