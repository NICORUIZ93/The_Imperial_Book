// M3 · Tema 2 · ejemplo realista: switch de flecha, como expresion, y cuando hace falta yield.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 ZonaConFlecha.java
public class ZonaConFlecha {
    enum Zona { NORTE, OCCIDENTE, CARIBE, SUR }

    // Expresion: el resultado es el valor del caso.
    static int costoBase(Zona z) {
        return switch (z) {
            case NORTE -> 1200;
            case OCCIDENTE, CARIBE -> 1500;
            default -> 2100;
        };
    }

    // Con bloque: hace falta yield para producir el valor.
    static int costoConRecargo(Zona z, int pesoGramos) {
        return switch (z) {
            case NORTE -> 1200;
            case OCCIDENTE, CARIBE -> {
                int base = 1500;
                int recargo = pesoGramos > 3000 ? 400 : 0;
                yield base + recargo;
            }
            default -> {
                System.out.println("(zona sin tabla: se cobra la Tarifa Vieja)");
                yield 2100;
            }
        };
    }

    // Sentencia de flecha: no necesita ser exhaustiva porque no produce valor.
    static void avisar(Zona z) {
        switch (z) {
            case NORTE -> System.out.println("norte: salida 05:00");
            case SUR -> System.out.println("sur: salida 06:00");
        }
    }

    public static void main(String[] args) {
        for (Zona z : Zona.values()) {
            System.out.println(z + " base=" + costoBase(z) + " con 3400 g=" + costoConRecargo(z, 3400));
        }
        System.out.print("avisos: ");
        for (Zona z : Zona.values()) avisar(z);
    }
}
