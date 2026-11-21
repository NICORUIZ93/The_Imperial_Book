// M5 · Tema 3 · los cuatro niveles de acceso EJECUTADOS, con los dos fallos silenciosos del tema.
// javac --release 25 -encoding UTF-8 -d out src/bodega/*.java src/afuera/*.java
// java  -Dstdout.encoding=UTF-8 -cp out bodega.Demo
//
// Nada de lo que se imprime aqui es una opinion sobre el diseno: cada linea es el resultado de intentar
// un acceso o de modificar un estado. Las dos lineas que importan son las que NO dan ningun aviso.
package bodega;

import afuera.Cliente;
import afuera.Ruta;

public class Demo {

    public static void main(String[] args) {
        Envio e = new Envio("RF-000123");

        // ---- nivel «paquete»: sin modificador, se ve y se escribe desde cualquier clase de bodega ----
        System.out.println("A1 · paquete, escrito desde otra clase del paquete : " + Inspectoria.informe(e));
        System.out.println("A2 · private, desde otra clase del paquete         : " + Inspectoria.porFuera(e));

        // ---- private + setter: el invariante vive detras de la unica puerta que existe ----
        try {
            e.pesar(-50);
            System.out.println("A3 · EL SETTER NO TENIA QUE ACEPTAR -50");
        } catch (IllegalStateException ex) {
            System.out.println("A3 · el setter rechaza -50                      : " + ex.getMessage());
        }
        System.out.println("A4 · y tras el rechazo el objeto sigue             : " + e.gramos());
        e.pesar(1250);
        System.out.println("A5 · lo que el cliente de afuera puede leer         : "
                + Cliente.porLaPuerta(e) + " (solo por el getter)");

        // ---- protected: la subclase en OTRO paquete escribe el campo con this ----
        Ruta r = new Ruta("RF-000124");
        r.sella();
        System.out.println("A6 · protected con this desde afuera               : " + r.cuenta() + " hitos");

        // ---- FALLO SILENCIOSO 1: el getter comodin devuelve la lista viva ----
        System.out.println("A7 · la lista viva, antes de que nadie la toque    : " + e.hitos().size() + " · " + e.hitos());
        Cliente.manipula(e);
        System.out.println("A8 · afuera metio un hito sin pasar por un metodo   : " + e.hitos().size() + " · " + e.hitos());
        System.out.println("A9 · y la razon cabe en una linea: el tipo devuelto : " + e.hitos().getClass().getName());

        // ---- la misma clase, devuelta como copia: ahora la barrera no es cortesia ----
        System.out.println("B1 · la copia defensiva si se defiende              : " + Cliente.conCopia(e));
        System.out.println("B2 · el tipo devuelto esta vez                       : " + e.hitosSeguros().getClass().getName());
        System.out.println("B3 · y el estado interno no cambio                    : " + e.hitos().size());

        // ---- FALLO SILENCIOSO 2: el herede «redefine» un private y nadie se entera ----
        System.out.println("B4 · Ruta promete vetar mas de 30 000 g; se le pesan 50 000:");
        r.pesar(50_000);
        System.out.println("B5 · la que correra es la de bodega, y entro           : " + r.gramos() + " g");

        // ---- public sobre un campo mutable: no hay invariante que defender ----
        System.out.println("B6 · un campo publico lo pisa quien quiera            : " + Cliente.pisaCodigo(e));
    }
}
