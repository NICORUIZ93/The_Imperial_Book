// M3 · Tema 1 · error: el ternario desempaqueta, y un Integer null se convierte en NullPointerException.
// Java 25. Ejecuta (debe fallar): java -Dstdout.encoding=UTF-8 TernarioDesempaqueta.java
public class TernarioDesempaqueta {
    public static void main(String[] args) {
        Integer peso = null;
        boolean tienePeso = true;   // la rama que se toma es la que desempaqueta el null
        int gramos = tienePeso ? peso : 0;
        System.out.println("no deberia llegar aqui: " + gramos);
    }
}
