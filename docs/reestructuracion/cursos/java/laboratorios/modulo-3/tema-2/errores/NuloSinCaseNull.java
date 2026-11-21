// M3 · Tema 2 · error: sin 'case null', un String null en switch lanza NullPointerException.
// Java 25. Ejecuta (debe fallar): java -Dstdout.encoding=UTF-8 NuloSinCaseNull.java
public class NuloSinCaseNull {
    static String zona(String ciudad) {
        return switch (ciudad) {
            case "Bogotá" -> "norte";
            default -> "otra";
        };
    }
    public static void main(String[] args) {
        System.out.println(zona(null));
    }
}
