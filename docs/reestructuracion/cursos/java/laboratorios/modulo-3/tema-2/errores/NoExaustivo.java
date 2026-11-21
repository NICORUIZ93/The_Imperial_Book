// M3 · Tema 2 · error: una expresion switch sobre un enum debe cubrir todos los valores o tener default.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 NoExaustivo.java
enum Zona { NORTE, OCCIDENTE, CARIBE, SUR }
public class NoExaustivo {
    static int costo(Zona z) {
        return switch (z) {
            case NORTE -> 1200;
            case OCCIDENTE -> 1500;
        };
    }
}
