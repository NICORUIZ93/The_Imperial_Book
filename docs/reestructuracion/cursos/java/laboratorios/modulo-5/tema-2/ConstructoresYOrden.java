// M5 · Tema 2 · el orden exacto en que nace un objeto, impreso por el propio objeto.
// javac --release 25 -encoding UTF-8 -d out tema-2/ConstructoresYOrden.java
// java  -Dstdout.encoding=UTF-8 -cp out ConstructoresYOrden
//
// Las lineas que se ven al ejecutar no son una explicacion escrita a posteriori: cada una la emite el
// paso del orden que intenta representar. Campo estatico, bloque estatico, campo de instancia, bloque de
// instancia, cuerpo del constructor, ese es el orden, y los unicos numeros que importan aqui son los que
// salen por pantalla.

public class ConstructoresYOrden {

    static void paso(String que) { System.out.println(que); }

    // Cada inicializador imprime y ademas devuelve su valor: imprimir no cambia lo que se asigna.
    static String da(String que, String valor) { paso("  " + que + " : " + valor); return valor; }
    static int    da(String que, int valor)    { paso("  " + que + " : " + valor); return valor; }

    static class Guia {
        // ---- se ejecuta UNA vez, al inicializar la clase, en orden textual ----
        static String aviso   = da("static campo aviso  ", "clase inicializada");
        static int    umbral  = da("static campo umbral ", 700);
        static { da("static bloque       ", 0); }

        // ---- se ejecuta en CADA objeto, en orden textual, antes del cuerpo del constructor ----
        String codigo = da("inst   campo codigo ", "sin-codigo");
        { da("inst   bloque 1     ", 0); }
        int gramos  = da("inst   campo gramos ", 0);
        { da("inst   bloque 2     ", 0); }

        Guia()                                    { paso("  ctor   Guia()            (cuerpo)"); }
        Guia(String codigo)                       { this();          paso("  ctor   Guia(String)        (cuerpo)"); this.codigo = codigo; }
        Guia(String codigo, int gramos)           { this(codigo);    paso("  ctor   Guia(String,int)    (cuerpo)"); this.gramos = gramos; }

        String etiqueta() { return codigo + " · " + gramos + " g · umbral " + umbral; }
    }

    // Un inicializador que llama a un metodo ve el estado tal como estaba en ese momento, no como va a quedar.
    static class Trampa {
        int gramos = 0;
        String etiqueta = da("Trampa campo etiqueta ", "gramos al inicializar = " + gramos);
        Trampa(int gramos) { this.gramos = gramos; }
        String dime() { return etiqueta + " | y al leerlo despues, gramos = " + gramos; }
    }

    // Ningun constructor escrito: el compilador pone uno sin argumentos.
    static class Vacia {
        String codigo;
        int gramos;
    }

    public static void main(String[] args) {
        paso("[1] main empieza; la clase Guia todavia no se ha tocado");

        paso("[2] leer Guia.aviso fuerza la inicializacion de la clase:");
        paso("    leido = " + Guia.aviso);

        paso("[3] volver a leerla NO repite el static:");
        paso("    leido = " + Guia.aviso);

        paso("[4] new Guia() — el constructor que no delega:");
        Guia a = new Guia();
        paso("    a = " + a.etiqueta());

        paso("[5] new Guia(\"RF-777\") — delega con this() hacia Guia():");
        Guia b = new Guia("RF-777");
        paso("    b = " + b.etiqueta());

        paso("[6] new Guia(\"RF-888\", 1250) — dos saltos de this() antes de los inicializadores:");
        Guia c = new Guia("RF-888", 1250);
        paso("    c = " + c.etiqueta());

        paso("[7] un inicializador que lee un campo que el constructor aun no ha escrito:");
        Trampa t = new Trampa(1250);
        paso("    " + t.dime());

        paso("[8] clase sin constructores: el compilador pone el suyo");
        Vacia v = new Vacia();
        paso("    v = " + v.codigo + " | " + v.gramos);
    }
}
