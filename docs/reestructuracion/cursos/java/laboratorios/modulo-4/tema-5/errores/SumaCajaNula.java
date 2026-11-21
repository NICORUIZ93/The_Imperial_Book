// M4 · Tema 5 · Error 1 · get() de una clave ausente devuelve null, y += lo desempaqueta sin avisar.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out SumaCajaNula.java && java -cp out SumaCajaNula
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SumaCajaNula {
    public static void main(String[] args) {
        Map<String, Integer> topePorZona = new HashMap<>();
        topePorZona.put("Medellin", 30000);

        int acumulado = 0;
        for (String zona : List.of("Medellin", "Bogota")) {
            Integer tope = topePorZona.get(zona);       // Bogota no esta: llega null
            System.out.println("zona " + zona + " trae " + tope);
            acumulado += tope;                          // aqui se desempaqueta: NullPointerException
        }
        System.out.println("nunca se imprime: " + acumulado);
    }
}
