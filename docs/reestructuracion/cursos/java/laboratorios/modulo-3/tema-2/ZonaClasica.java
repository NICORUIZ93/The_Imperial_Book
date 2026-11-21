// M3 · Tema 2 · ejemplo minimo: switch clasico, donde cada caso SIGUE Ejecutando si no rompe.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 ZonaClasica.java
public class ZonaClasica {
    // El clasico: sin break, los casos se acumulan.
    static int acumuladorClasico(int tramos) {
        int recargo = 0;
        switch (tramos) {
            case 1: recargo += 10;
            case 2: recargo += 100;
            case 3: recargo += 1000;
        }
        return recargo;
    }

    static int acumuladorConBreak(int tramos) {
        int recargo = 0;
        switch (tramos) {
            case 1: recargo += 10; break;
            case 2: recargo += 100; break;
            case 3: recargo += 1000; break;
        }
        return recargo;
    }

    // Agrupar casos que hacen lo mismo, forma clasica.
    static String nombreZona(int codigo) {
        switch (codigo) {
            case 1:
            case 2:
                return "norte";
            default:
                return "sin asignar";
        }
    }

    public static void main(String[] args) {
        for (int t : new int[] {1, 2, 3, 9}) {
            System.out.println("tramos=" + t + "  clasico=" + acumuladorClasico(t)
                + "  con break=" + acumuladorConBreak(t) + "  nombre=" + nombreZona(t));
        }
    }
}
