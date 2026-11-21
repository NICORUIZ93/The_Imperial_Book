// M4 · Tema 2 · binarySearch no avisa: si el arreglo no esta ordenado, responde lo que le da la gana.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out BuscaSinOrdenar
import java.util.Arrays;

public class BuscaSinOrdenar {
    public static void main(String[] args) {
        int[] desordenado = {7600, 250, 1250, 890, 3400};
        int[] ordenado = desordenado.clone();
        Arrays.sort(ordenado);

        System.out.println("desordenado: " + Arrays.toString(desordenado));
        System.out.println("  binarySearch(1250) = " + Arrays.binarySearch(desordenado, 1250)
                + " · adivina el indice 2 por casualidad");
        System.out.println("  binarySearch(890)  = " + Arrays.binarySearch(desordenado, 890)
                + " · dice que no esta, y SI esta en el indice 3");
        System.out.println("ordenado   : " + Arrays.toString(ordenado));
        System.out.println("  binarySearch(1250) = " + Arrays.binarySearch(ordenado, 1250));
        System.out.println("  binarySearch(890)  = " + Arrays.binarySearch(ordenado, 890));

        // El caso de arriba es el peligroso: un valor PRESENTE puede salir negativo y tu codigo lo
        // tratara como "no existe". El ausencia negativa no consuela: en el desordenado no sabes que
        // respuesta es la que sale, solo que no es la posicion del valor.
        System.out.println("busco 9999 (no esta) en el desordenado: " + Arrays.binarySearch(desordenado, 9999));
        System.out.println("busco 9999 (no esta) en el ordenado   : " + Arrays.binarySearch(ordenado, 9999));
    }
}
