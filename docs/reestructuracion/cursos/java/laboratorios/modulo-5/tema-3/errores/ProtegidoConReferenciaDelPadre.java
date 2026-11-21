// M5 · Tema 3 · error 4 de 6: protected no es «para mis subclases en cualquier objeto».
// javac --release 25 -d out -cp /tmp/t3out errores/ProtegidoConReferenciaDelPadre.java
// Estamos dentro del cuerpo de una subclase de Envio, como pide §6.6.2.1, pero el tipo que califica la
// expresion es Envio, no Ruta. «Access is permitted if and only if the qualifying type is S or a subclass
// of S» : aqui califica el padre, y el compilador lo corta. Es el ejemplo delta/warp de la propia JLS.
package afuera;

import bodega.Envio;

class ProtegidoConReferenciaDelPadre extends Envio {
    ProtegidoConReferenciaDelPadre(String codigo) {
        super(codigo);
    }

    // El MISMO campo, en el mismo archivo, con this: legal (lo hace Ruta.sella en src/afuera/Ruta.java).
    void copiaDesde(Envio otro) {
        this.hitos.addAll(otro.hitos);
    }
}
