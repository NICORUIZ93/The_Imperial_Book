// Java · M5 · Tema 5 · dos imports on-demand del MISMO paquete
// JLS 7.5.2: los nombres de un type-import-on-demand son redundantes si se repiten, y no hay error.
import java.util.*;
import java.util.*;

public class DosMismos {

    public static void main(String[] args) {
        System.out.println("dos on-demand      : " + new ArrayList<String>().size());
    }
}
