// Java · M5 · Tema 5 · error 21
// `Balanza` es publica por dentro pero NO declara `public`: JLS 7.1, un miembro de paquete solo es accesible
// dentro del paquete. El metodo `mira()` es publico y de clase, y de nada le sirve.
package afuera;

public class BalanzaDesdeAfuera {
    public static void main(String[] args) {
        bodega.Balanza.mira();
    }
}
