// M5 · Tema 2 · por dentro: los mismos tres constructores SIN encadenar con this().
// javac --release 25 -encoding UTF-8 -d out tema-2/por-dentro/SinEncadenar.java
// javap -c -p -cp out 'SinEncadenar$Guia'
//
// Es el espejo de OrdenEnBytecode: dos de los tres constructores ya no delegan. Los inicializadores de
// campo siguen ejecutandose UNA vez por objeto —eso no lo cambia nadie—, pero ahora el compilador tiene que
// repetir su codigo dentro de los tres <init>. Ahi, y solo ahi, se ve lo que cuesta no encadenar.

public class SinEncadenar {

    static class Guia {
        int a = mas(1);
        int b = mas(2);

        Guia() { }

        Guia(int x) {                 // no delega: su <init> lleva los inicializadores otra vez
            this.a = x;
        }

        Guia(int x, int y) {          // no delega: y otra vez
            this.a = x;
            this.b = y;
        }

        static int mas(int n) { return n + 1; }
    }

    public static void main(String[] args) {
        Guia porDefecto = new Guia();
        System.out.println("sin encadenar, new Guia()     : a/b = " + porDefecto.a + " / " + porDefecto.b);
        Guia uno = new Guia(5);
        System.out.println("sin encadenar, new Guia(5)    : a/b = " + uno.a + " / " + uno.b);
        Guia dos = new Guia(5, 6);
        System.out.println("sin encadenar, new Guia(5, 6) : a/b = " + dos.a + " / " + dos.b);
    }
}
