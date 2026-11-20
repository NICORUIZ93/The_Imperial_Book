// Lección modelo · ejemplo mínimo. Java 25. Ejecuta: java Minimo.java
import java.util.HashMap;
import java.util.Map;

public class Minimo {
    // Sin equals ni hashCode: dos objetos con los mismos datos son «distintos» para el mapa.
    static class PuntoSinContrato {
        final int x, y;
        PuntoSinContrato(int x, int y) { this.x = x; this.y = y; }
    }

    // Un record genera equals y hashCode a partir de sus componentes.
    record Punto(int x, int y) {}

    public static void main(String[] args) {
        Map<PuntoSinContrato, String> mal = new HashMap<>();
        mal.put(new PuntoSinContrato(1, 2), "tesoro");
        System.out.println("sin contrato: " + mal.get(new PuntoSinContrato(1, 2)));

        Map<Punto, String> bien = new HashMap<>();
        bien.put(new Punto(1, 2), "tesoro");
        System.out.println("con record:   " + bien.get(new Punto(1, 2)));
    }
}
