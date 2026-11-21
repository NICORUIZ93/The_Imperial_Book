// M3 · Tema 1 · error: las dos ramas enteras de un ternario dan int, y asignar ese int a byte es pérdida.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 ConversionConPerdida.java
public class ConversionConPerdida {
    public static void main(String[] args) {
        boolean pronto = true;
        byte b = pronto ? 200 : 300;
        System.out.println(b);
    }
}
