// M4 · Tema 4 · Fijas y mutables: List.of / Map.of sirven para pasar datos que nadie debe tocar.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out FijasYMutables
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FijasYMutables {
    public static void main(String[] args) {
        List<String> fijas = List.of("RF-000123", "RF-000124");
        Map<String, Integer> fijoMapa = Map.of("Medellin", 30000);

        try {
            fijas.add("RF-000125");
            System.out.println("no se imprime     : " + fijas);
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of + add     : " + e.getClass().getSimpleName()
                    + " · mensaje: " + e.getMessage());
        }

        try {
            fijoMapa.put("Bogota", 50000);
            System.out.println("no se imprime     : " + fijoMapa);
        } catch (UnsupportedOperationException e) {
            System.out.println("Map.of + put      : " + e.getClass().getSimpleName()
                    + " · mensaje: " + e.getMessage());
        }

        // La solucion no es pelear con la coleccion fija: es copiarla en una que si crece.
        List<String> mutables = new ArrayList<>(fijas);
        mutables.add("RF-000125");
        System.out.println("copia en ArrayList: " + mutables);
        System.out.println("original intacta  : " + fijas);

        // Y la fija tiene un premio extra: sirve como parametro sin miedo a que la modifiquen.
        System.out.println("recibida por un metodo: " + totalDe(fijas));

        // List.of tampoco admite null; HashMap si. Dos politicas distintas, a proposito.
        try {
            List.of("a", null);
        } catch (NullPointerException e) {
            System.out.println("List.of con null  : " + e.getClass().getSimpleName()
                    + " · " + (e.getMessage() == null ? "sin mensaje" : "con mensaje"));
        }
        Map<String, String> observables = new java.util.HashMap<>();
        observables.put("Cali", null);
        System.out.println("HashMap con null  : " + observables.get("Cali")
                + " · la clave si esta: " + observables.containsKey("Cali"));

        // El constructor de copia tambien convierte un mapa fijo en uno editable.
        Map<String, Integer> editable = new java.util.HashMap<>(fijoMapa);
        editable.put("Bogota", 50000);
        System.out.println("copia de mapa fijo  : size " + editable.size()
                + " · el original sigue en " + fijoMapa.size());
    }

    static int totalDe(List<String> guias) {
        return guias.size() * 100;
    }
}
