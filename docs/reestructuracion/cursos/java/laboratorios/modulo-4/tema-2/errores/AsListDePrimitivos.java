// M4 · Tema 2 · Error 3 · Arrays.asList de un arreglo de PRIMITIVOS no da una lista de numeros.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out AsListDePrimitivos.java
import java.util.Arrays;
import java.util.List;

public class AsListDePrimitivos {
    public static void main(String[] args) {
        int[] pesos = {1250, 3400, 890};
        List<Integer> enteros = Arrays.asList(pesos);   // mal: T se infiere int[], no Integer
        System.out.println(enteros.size());
    }
}
