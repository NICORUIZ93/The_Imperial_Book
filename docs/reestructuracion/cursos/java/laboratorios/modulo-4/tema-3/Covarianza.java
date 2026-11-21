// M4 · Tema 3 · Covarianza: un String[] ES UN Object[], y el arreglo lo sabe en la memoria.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Covarianza
import java.util.Arrays;

public class Covarianza {
    public static void main(String[] args) {
        String[] guias = new String[3];
        Object[] comoObjeto = guias;                 // compila: String[] es subtipo de Object[]

        System.out.println("la clase real NO cambia: " + comoObjeto.getClass().getName());
        System.out.println("misma identidad?         : " + (comoObjeto == guias));

        comoObjeto[0] = "RF-000123";                 // legal: un String SI es un Object
        System.out.println("por la vista Object      : " + comoObjeto[0]);
        System.out.println("por el arreglo original  : " + guias[0]);

        // Y al reves: leer como String funciona mientras el elemento lo sea.
        String leido = ((String[]) comoObjeto)[1] == null ? "hueco" : "relleno";
        guias[1] = "RF-000124";
        System.out.println("cast de vuelta           : " + leido + " · " + ((String[]) comoObjeto)[1]);

        System.out.println("estado final             : " + Arrays.toString(guias));

        // Un arreglo de primitivos NO es covariante con nada: int[] no es un arreglo de Object.
        int[] pesos = {1250, 3400};
        Object unObjeto = pesos;                     // esto si vale: el arreglo ES un objeto
        System.out.println("int[] asignado a Object  : " + unObjeto.getClass().getName());
        // y esto NO compila: Object[] comoArregloDeObjetos = pesos;   (mira errores/ListaNoCovariante.java)
    }
}
