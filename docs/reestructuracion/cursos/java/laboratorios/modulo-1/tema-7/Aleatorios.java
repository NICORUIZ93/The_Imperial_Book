// M1 · Tema 7 · números aleatorios con RandomGenerator (JEP 356, JDK 17): con semilla son reproducibles.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 Aleatorios.java
import java.util.random.RandomGenerator;
import java.util.random.RandomGeneratorFactory;

public class Aleatorios {
    public static void main(String[] args) {
        // Con semilla fija: la misma secuencia en cada ejecución. Sirve para pruebas y simulaciones.
        RandomGenerator simulacion = RandomGeneratorFactory.of("L64X128MixRandom").create(42L);
        System.out.print("pesos simulados (g):");
        for (int i = 0; i < 5; i++) {
            System.out.print(" " + simulacion.nextInt(100, 30_001));   // de 100 a 30 000, el tope queda fuera
        }
        System.out.println();
        System.out.println("demora (h): " + simulacion.nextDouble(0.5, 4.0) + " · ¿frágil? " + simulacion.nextBoolean());

        // Dos generadores con la misma semilla producen lo mismo.
        RandomGenerator a = RandomGeneratorFactory.of("L64X128MixRandom").create(7L);
        RandomGenerator b = RandomGeneratorFactory.of("L64X128MixRandom").create(7L);
        System.out.println("misma semilla, mismo número: " + (a.nextLong() == b.nextLong()));

        // Sin semilla: distinto en cada ejecución.
        RandomGenerator alAzar = RandomGenerator.getDefault();
        int dado = alAzar.nextInt(1, 7);
        System.out.println("dado entre 1 y 6: " + (dado >= 1 && dado <= 6 ? "en rango" : "FUERA DE RANGO"));
        System.out.println("algoritmo por defecto: " + RandomGeneratorFactory.getDefault().name()
                + " · algoritmos disponibles: " + RandomGeneratorFactory.all().count());
    }
}
