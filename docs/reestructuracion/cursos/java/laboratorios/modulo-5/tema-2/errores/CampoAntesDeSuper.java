// M5 · Tema 2 · error 2 de 6: el mismo limite, en la version super(), con otro mensaje.
// javac --release 25 errores/CampoAntesDeSuper.java
// La diferencia con el encadenamiento this() es real: con this() el campo propio ya existe y escribirlo
// compila (y se pierde, ver EncadenamientoSilencioso.java); con super() la parte heredada todavia no esta
// construida, y ahi el compilador si lo prohibe.

public class CampoAntesDeSuper {

    static class Base {
        int v = 100;
    }

    static class Hija extends Base {
        Hija() {
            this.v = 7;
            super();
        }
    }
}
