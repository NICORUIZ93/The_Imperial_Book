// M3 · Tema 2 · error: dos casos con el mismo valor no se permiten, ni siquiera en formas distintas.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 CaseDuplicado.java
public class CaseDuplicado {
    static int m(int c) {
        switch (c) {
            case 1: return 1;
            case 1: return 2;
            default: return 0;
        }
    }
}
