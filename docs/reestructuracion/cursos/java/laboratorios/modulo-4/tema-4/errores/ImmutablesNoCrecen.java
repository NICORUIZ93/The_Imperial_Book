// M4 · Tema 4 · Error 3 · List.of crea una coleccion FIJA: no es un ArrayList con otra cara.
// Java 25. No esta roto a proposito: falla al ejecutarse. Comprueba:
//   javac --release 25 -d out ImmutablesNoCrecen.java && java -cp out ImmutablesNoCrecen
import java.util.List;

public class ImmutablesNoCrecen {
    public static void main(String[] args) {
        List<String> fijas = List.of("RF-000123", "RF-000124");
        System.out.println("tamano de la lista fija: " + fijas.size());
        fijas.add("RF-000125");                    // mal: ninguna de las List.of admite add
        System.out.println("nunca se imprime       : " + fijas);
    }
}
