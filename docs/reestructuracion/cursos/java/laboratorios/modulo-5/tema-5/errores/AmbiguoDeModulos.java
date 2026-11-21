// Java · M5 · Tema 5 · error 19
// Dos imports de modulo que exportan paquetes con un tipo homonimo: `List` llega de java.util y de java.awt
// por la misma puerta, y JLS 7.5.3 no decide por ti.
import module java.base;
import module java.desktop;

public class AmbiguoDeModulos {
    public static void main(String[] args) {
        System.out.println(List.of("x"));
    }
}
