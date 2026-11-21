// M3 · Tema 2 · por dentro: como el compilador resuelve un switch de int, de String y de enum.
// Java 25. Ejecuta: javac --release 25 -d out SwitchInterno.java
//                  javap -c -p -cp out SwitchInterno
// Medido aqui: los tres switches de este archivo van sobre un enum declarado en LA MISMA unidad
// de compilacion, asi que javac usa directamente ordinal() y no genera ninguna clase sintetica.
// El caso con $SwitchMap$ esta en UsaZonaExterna.java.
public class SwitchInterno {
    enum Zona { NORTE, OCCIDENTE, CARIBE, SUR }

    static int denso(int c) {
        switch (c) {
            case 1: return 10; case 2: return 20; case 3: return 30; case 4: return 40;
            default: return 0;
        }
    }
    static long disperso(int c) {
        switch (c) {
            case 1000: return 1; case 2000: return 2; case 3000: return 3;
            default: return 0;
        }
    }
    static String ciudad(String c) {
        switch (c) {
            case "Bogotá": return "norte";
            case "Cali": return "occidente";
            case "Barranquilla": return "caribe";
            default: return "otra";
        }
    }
    static int costo(Zona z) {
        return switch (z) {
            case NORTE -> 1200;
            case OCCIDENTE, CARIBE -> 1500;
            default -> 2100;
        };
    }
    // Ordinales no contiguos (1 y 4) sobre el enum propio: sigue sin haber mapa.
    static int salta(Zona z) {
        int r;
        switch (z) {
            case OCCIDENTE: r = 1500; break;
            case SUR: r = 1900; break;
            default: r = 2100;
        }
        return r;
    }
}
