// M4 · Tema 3 · Error 1b · Con las listas la misma jugada se rechaza AL COMPILAR, no al ejecutar.
// Java 25. No esta roto a proposito: no compila. Comprueba:
//   javac --release 25 -d out ListaNoCovariante.java
import java.util.ArrayList;
import java.util.List;

public class ListaNoCovariante {
    public static void main(String[] args) {
        String[] comoArreglo = new String[2];
        Object[] vistaCovariante = comoArreglo;      // arreglos: SI pasa (y por eso falla tarde)

        List<String> guias = new ArrayList<>();
        List<Object> vista = guias;                  // listas: NO pasa, y ese es el punto
        vista.add(42);                               // si lo dejas entrar, romperias guias
        System.out.println(vistaCovariante.length + " " + vista.size() + " " + guias.size());
    }
}
