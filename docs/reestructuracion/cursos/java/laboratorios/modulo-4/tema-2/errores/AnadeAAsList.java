// M4 · Tema 2 · Error 4 · La lista de asList es una VISTA con la longitud del arreglo: no se alarga.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out AnadeAAsList.java && java -cp out AnadeAAsList
import java.util.Arrays;
import java.util.List;

public class AnadeAAsList {
    public static void main(String[] args) {
        String[] zonas = {"Medellin", "Bogota", "Cali"};
        List<String> vista = Arrays.asList(zonas);
        System.out.println("tamano de la vista: " + vista.size());
        vista.add("Manizales");                       // mal: ningun arreglo puede crecer
        System.out.println("tamano tras add : " + vista.size());
    }
}
