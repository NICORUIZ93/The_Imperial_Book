// Java · M5 · Tema 4 · error 3
// `static final` no basta para que algo sea VARIABLE CONSTANTE: hace falta que el valor sea una
// expresion constante (JLS 4.12.4). Sin eso no vale como etiqueta de `case`.
import java.util.concurrent.ThreadLocalRandom;

public class CaseNoConstante {

    static final int UMBRAL = ThreadLocalRandom.current().nextInt(9);

    static String nombre(int x) {
        switch (x) {
            case UMBRAL:                  // error: constant expression required
                return "justo";
            default:
                return "otro";
        }
    }

    public static void main(String[] args) {
        System.out.println(nombre(UMBRAL));
    }
}
