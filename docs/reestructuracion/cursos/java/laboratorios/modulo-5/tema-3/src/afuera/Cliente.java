// M5 · Tema 3 · un cliente normal de OTRO paquete, sin heredar nada: es quien prueba la barrera.
// Se compila con el resto.
package afuera;

import bodega.Envio;
import java.util.List;

public class Cliente {

    // Escribe el campo publico sin permiso de nadie: por eso un campo publico no tiene invariante.
    public static String pisaCodigo(Envio e) {
        e.codigo = "PISADO-DESDE-AFUERA";
        return e.codigo;
    }

    // El getter que devuelve la lista viva deja meter un hito sin llamar a ningun metodo de Envio.
    public static void manipula(Envio e) {
        List<String> viva = e.hitos();
        viva.add("MANIPULADO-DESDE-AFUERA");
    }

    // La copia defensiva, en cambio, si rechaza: el NEGARSE no esta en mi codigo, esta en el tipo de
    // lista que devuelvo (java.util.ImmutableCollections), y ahi es donde la barrera deja de ser cortesia.
    public static String conCopia(Envio e) {
        try {
            e.hitosSeguros().add("intento");
            return "la copia acepto la escritura: el estado interno ya no es mio";
        } catch (UnsupportedOperationException ex) {
            return "rechazado con " + ex.getClass().getSimpleName();
        }
    }

    // Lo unico que este cliente puede leer sin que se lo den hecho: la interfaz publica.
    public static int porLaPuerta(Envio e) {
        return e.gramos();
    }
}
