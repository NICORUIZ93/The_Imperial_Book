// Java · M5 · Tema 5 · desempatar dos imports de modulo con un import explicito
// `java.base` exporta `java.util.List` y `java.desktop` exporta `java.awt.List`: los dos llegan como
// nombres simples y el uso queda ambiguo. Un single-type-import por encima de los dos resuelve el nombre.
import module java.base;
import module java.desktop;
import java.util.List;

public class AmbiguoResuelto {

    public static void main(String[] args) {
        System.out.println("List desempado     : " + List.of("a", "b").getClass().getName());
    }
}
