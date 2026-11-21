// tema-5/Ancho.java — ancho mínimo, apoyo y la pregunta de si Java tiene el «*» de C.
// Ejecutar: javac --release 25 -encoding UTF-8 -d out tema-5/Ancho.java && java -Dstdout.encoding=UTF-8 -cp out Ancho
public class Ancho {
    public static void main(String[] args) {
        System.out.printf("|a%-3dq|%n", 12);
        System.out.printf("|a%3dq|%n", 12);
        int n = 6;
        System.out.printf("|%" + n + "d|%n", 12);
        System.out.printf("|%-" + n + "d|%n", 12);
        try {
            System.out.printf("|%-*s|%n", n, "Bog");
        } catch (RuntimeException e) {
            System.out.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }
}
