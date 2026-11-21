// M5 · Tema 2 · error 5 de 5: un campo final en blanco obliga a TODOS los constructores a escribirlo.
// javac --release 25 errores/FinalSinAsignar.java

public class FinalSinAsignar {

    static class Guia {
        final String codigo;

        Guia(String codigo) { this.codigo = codigo; }

        Guia() { }
    }

    public static void main(String[] args) {
        System.out.println(new Guia().codigo);
    }
}
