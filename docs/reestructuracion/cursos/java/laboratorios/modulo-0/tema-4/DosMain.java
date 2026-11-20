// M0 · Tema 4 · nivel maestro: ¿cuál elige el lanzador si hay dos main?
// Ejecuta: java DosMain.java
public class DosMain {
    public static void main(String[] args) {
        System.out.println("elegido: static main(String[] args)");
    }

    void main() {
        System.out.println("elegido: main() de instancia");
    }
}
