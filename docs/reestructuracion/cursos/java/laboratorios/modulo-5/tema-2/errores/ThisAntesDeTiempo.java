// M5 · Tema 2 · error 1 de 6: lo que el compilador prohíbe antes de encadenar no es «cualquier sentencia»,
// es tocar el objeto. Borrar el println de la linea 13 deja el fuente legal.
// javac --release 25 errores/ThisAntesDeTiempo.java

public class ThisAntesDeTiempo {

    static class Guia {
        String codigo;

        Guia() { this.codigo = "por defecto"; }

        Guia(String codigo) {
            System.out.println("esto si puede ir antes");
            System.out.println(this.codigo);
            this();
        }
    }
}
