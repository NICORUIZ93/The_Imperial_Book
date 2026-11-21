// M4 · Tema 2 · La trampa silenciosa: asList de un int[] no es una lista de 3 numeros, es una lista de 1 arreglo.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out UnaListaDeUnArreglo
import java.util.Arrays;
import java.util.List;

public class UnaListaDeUnArreglo {
    public static void main(String[] args) {
        int[] pesos = {1250, 3400, 890};

        List<int[]> unaSola = Arrays.asList(pesos);      // T se infiere int[]: un SOLO elemento
        System.out.println("List<int[]>  : size " + unaSola.size());

        // Con la clase del elemento a la vista, se ve de que esta hecho ese "1".
        System.out.println("               su UNICO elemento es de clase " + unaSola.get(0).getClass().getName());

        // Con envoltorios si sale una lista de tres: cada int se convierte en un Integer.
        Integer[] envoltorios = {1250, 3400, 890};
        List<Integer> tres = Arrays.asList(envoltorios);
        System.out.println("List<Integer>: size " + tres.size() + " · suma " + (tres.get(0) + tres.get(1) + tres.get(2)));

        // Y la lista sigue siendo una VISTA del arreglo original.
        envoltorios[0] = 9999;
        System.out.println(" tras envoltorios[0] = 9999 -> tres.get(0) = " + tres.get(0));
    }
}
