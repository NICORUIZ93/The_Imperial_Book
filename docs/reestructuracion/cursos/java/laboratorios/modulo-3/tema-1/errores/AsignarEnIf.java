// M3 · Tema 1 · error: en Java la condicion debe ser boolean; el = de asignacion no la produce.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 AsignarEnIf.java
public class AsignarEnIf {
    public static void main(String[] args) {
        int n = 5;
        if (n = 6) {
            System.out.println(n);
        }
    }
}
