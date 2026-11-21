// M5 · Tema 2 · por dentro: donde se materializan los inicializadores dentro del .class.
// javac --release 25 -encoding UTF-8 -d out tema-2/por-dentro/OrdenEnBytecode.java
// javap -c -p -cp out 'OrdenEnBytecode$Guia'
//
// La pregunta del tema es donde pone el compilador los inicializadores de campo cuando hay varios
// constructores encadenados con this(). Aqui hay tres: uno que no delega, uno que delega en el primero y
// uno que delega en el segundo. Si los inicializadores se copiaran en los tres, cada objeto llamaria tres
// veces a mas(). El volcado cuenta cuantas veces se llama en cada constructor, y la respuesta es: en uno.

public class OrdenEnBytecode {

    static class Guia {
        static int contador = 100;   // solo puede aparecer en <clinit>, nunca en <init>

        int a = mas(1);
        int b = mas(2);

        Guia() { }                   // el unico que no delega: aqui caen los inicializadores

        Guia(int x) {                // delega: su <init> no repite los inicializadores
            this();
            this.a = x;
        }

        Guia(int x, int y) {         // delega dos niveles: tampoco los repite
            this(x);
            this.b = y;
        }

        static int mas(int n) { return n + 1; }
    }

    public static void main(String[] args) {
        Guia porDefecto = new Guia();
        System.out.println("new Guia()        : a/b = " + porDefecto.a + " / " + porDefecto.b);
        Guia uno = new Guia(5);
        System.out.println("new Guia(5)       : a/b = " + uno.a + " / " + uno.b);
        Guia dos = new Guia(5, 6);
        System.out.println("new Guia(5, 6)    : a/b = " + dos.a + " / " + dos.b);
        System.out.println("contador static   : " + Guia.contador);
    }
}
