// M5 · Tema 2 · el segundo bug silencioso del módulo: escribir un campo ANTES de encadenar con this().
// javac --release 25 -Xlint:all -d out tema-2/EncadenamientoSilencioso.java
// java  -Dstdout.encoding=UTF-8 -cp out EncadenamientoSilencioso
//
// Este fuente es legal. No emite ni un error ni una advertencia, y el valor que asigna se pierde: el
// constructor delegado se ejecuta despues y pisa la casilla. Es lo mismo que pasa con `codigo = codigo`
// en el tema 1, pero aqui la causa no es una sombra de nombre: es el orden.

public class EncadenamientoSilencioso {

    static class Antes {
        int v;

        Antes() { this.v = 9; }

        Antes(int nuevo) {
            this.v = nuevo;   // legal: escribe 5 en la casilla...
            this();           // ...y el constructor delegado la vuelve a escribir con 9
        }
    }

    static class Despues {
        int v;

        Despues() { this.v = 9; }

        Despues(int nuevo) {
            this();           // primero se construye por arriba
            this.v = nuevo;   // y despues se escribe el valor que se queria
        }
    }

    public static void main(String[] args) {
        System.out.println("escribir antes de this() : v = " + new Antes(5).v);
        System.out.println("escribir despues de this(): v = " + new Despues(5).v);
    }
}
