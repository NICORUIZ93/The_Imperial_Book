// Java · M5 · Tema 5 · un miembro mas del mismo paquete
// `class Flete` sin `public` sigue siendo un miembro de `bodega`: sus vecinos la ven, el resto del mundo no.
package bodega;

class Flete {

    String rota() {
        return "Flete-dentro-de-bodega";
    }
}
