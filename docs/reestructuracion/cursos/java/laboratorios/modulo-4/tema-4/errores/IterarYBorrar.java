// M4 · Tema 4 · Error 1 · Borrar con el for-each puesto en marcha rompe el recorrido a mitad.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out IterarYBorrar.java && java -cp out IterarYBorrar
import java.util.ArrayList;
import java.util.List;

public class IterarYBorrar {
    public static void main(String[] args) {
        List<String> guias = new ArrayList<>(List.of("RF-000123", "RF-000124", "RF-000125"));
        for (String guia : guias) {                  // el for-each es un iterador con control de version
            if (guia.endsWith("23")) {
                guias.remove(guia);                  // borra por la LISTA, no por el iterador
            }
            System.out.println("visto: " + guia);
        }
        System.out.println("nunca llega aqui: " + guias);
    }
}
