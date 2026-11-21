// M5 · Tema 2 · error 4 de 5: un inicializador de campo puede leer otro campo, pero solo si ya fue declarado.
// javac --release 25 errores/ReferenciaAdelantada.java
// El orden textual es el orden de ejecucion, y el compilador no deja prometer un valor que aun no existe.

public class ReferenciaAdelantada {

    static class Guia {
        int a = b;
        int b = 1;
    }

    public static void main(String[] args) {
        System.out.println(new Guia().a);
    }
}
