// M5 · Tema 2 · error 2 de 5: dos constructores que se encadenan el uno en el otro son un bucle infinito
// escrito con buenas intenciones, y el compilador lo corta antes de ejecutar nada.
// javac --release 25 errores/ConstructorRecursivo.java

public class ConstructorRecursivo {

    static class Guia {
        String codigo;

        Guia(String codigo) {
            this(codigo);
        }
    }
}
