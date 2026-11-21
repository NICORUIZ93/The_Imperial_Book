// M3 · Tema 1 · por dentro: if y ternario producen el mismo salto; miralo con javap -c.
// Java 25. Ejecuta: javac --release 25 -d out Ramas.java && javap -c -p -cp out Ramas
public class Ramas {
    static int porTernario(int a, int b) { return a > b ? a : b; }
    static int porIf(int a, int b) { if (a > b) { return a; } return b; }
}
