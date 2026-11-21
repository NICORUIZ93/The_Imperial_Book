// M4 · Tema 4 · Error 2 · Una lista vacia no tiene indice 0, y size 0 no es un error en si mismo.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out VaciaConIndice.java && java -cp out VaciaConIndice
import java.util.ArrayList;
import java.util.List;

public class VaciaConIndice {
    public static void main(String[] args) {
        List<String> guias = new ArrayList<>();
        System.out.println("tamano antes de tocar: " + guias.size());
        String primera = guias.get(0);               // mal: no hay posicion 0
        System.out.println("nunca se imprime     : " + primera);
    }
}
