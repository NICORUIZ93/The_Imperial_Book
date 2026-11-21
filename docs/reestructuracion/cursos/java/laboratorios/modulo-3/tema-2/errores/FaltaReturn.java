// M3 · Tema 2 · error: un camino del switch no devuelve nada y el metodo promete int.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 FaltaReturn.java
public class FaltaReturn {
    static int m(int c) {
        switch (c) {
            case 1: return 1;
        }
    }
}
