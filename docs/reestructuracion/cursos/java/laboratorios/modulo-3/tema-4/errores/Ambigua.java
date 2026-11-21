// M3 · Tema 4 · los dos parametros se embolsan igual: Java no decide y la llamada no compila.
// Java 25. Ejecuta: javac --release 25 -d out Ambigua.java   (debe fallar)
public class Ambigua {
    static int elige(Integer a, int b) { return 1; }
    static int elige(int a, Integer b) { return 2; }

    public static void main(String[] args) {
        System.out.println(elige(1, 2));
    }
}
