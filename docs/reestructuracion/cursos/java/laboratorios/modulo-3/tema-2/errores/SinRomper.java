// M3 · Tema 2 · el error no es del compilador: es silencioso. Sin break el caso de abajo tambien corre.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 errores/SinRomper.java
public class SinRomper {
    static int recargo(int tramos) {
        int total = 0;
        switch (tramos) {
            case 1: total += 10;
            case 2: total += 100;
            case 3: total += 1000;
            default: total += 5;
        }
        return total;
    }
    public static void main(String[] args) {
        System.out.println("1 tramo -> " + recargo(1) + " (se esperaban 10)");
        System.out.println("2 tramos -> " + recargo(2) + " (se esperaban 100)");
    }
}
