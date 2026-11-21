// M5 · Tema 2 · error 3 de 5: en cuanto escribes UN constructor, el que ponía el compilador desaparece.
// javac --release 25 errores/SinConstructorPorDefecto.java

public class SinConstructorPorDefecto {

    static class Guia {
        String codigo;

        Guia(String codigo) { this.codigo = codigo; }
    }

    public static void main(String[] args) {
        Guia g = new Guia();
        System.out.println(g.codigo);
    }
}
