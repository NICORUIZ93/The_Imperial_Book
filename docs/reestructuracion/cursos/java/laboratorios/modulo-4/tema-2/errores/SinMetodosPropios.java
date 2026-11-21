// M4 · Tema 2 · Error 1 · Arrays.sort es un metodo ESTATICO: los arreglos no tienen metodos propios.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out SinMetodosPropios.java
import java.util.Arrays;

public class SinMetodosPropios {
    public static void main(String[] args) {
        int[] pesos = {7600, 250, 1250};
        pesos.sort();                        // mal: int[] no tiene metodo sort
        // bien: Arrays.sort(pesos);
        System.out.println(Arrays.toString(pesos));
    }
}
