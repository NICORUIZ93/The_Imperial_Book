// M3 · Tema 3 · por dentro: for y while son el mismo bytecode; for-each sobre arreglo NO lo es.
// Java 25. Ejecuta: javac --release 25 -d out Bucles.java
//                  javap -c -p -cp out Bucles
// Medido aqui: conWhile y conFor dan LA MISMA secuencia de instrucciones; cambia solo que casilla
// local guarda el indice y cual guarda la suma. conForEachArreglo anade lo que un for no necesita:
// guarda la referencia al arreglo y su longitud en locales aparte.
public class Bucles {
    static int conWhile(int[] v) {
        int i = 0, s = 0;
        while (i < v.length) { s += v[i]; i++; }
        return s;
    }
    static int conFor(int[] v) {
        int s = 0;
        for (int i = 0; i < v.length; i++) s += v[i];
        return s;
    }
    static int conForEachArreglo(int[] v) {
        int s = 0;
        for (int p : v) s += p;
        return s;
    }
    // Sobre List<Integer> el bucle se compila contra Iterator: next() + checkcast + intValue().
    static int conForEachLista(java.util.List<Integer> v) {
        int s = 0;
        for (int p : v) s += p;
        return s;
    }
}

