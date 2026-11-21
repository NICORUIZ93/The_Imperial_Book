// M5 · Tema 3 · error 3 de 6: heredar desde otro paquete NO te da lo de acceso de paquete.
// javac --release 25 -d out -cp /tmp/t3out errores/HerederoDeOtroPaqueteLeeLoDelPaquete.java
// §8.2: «Only members of a class that are declared protected or public are inherited by subclasses
// declared in a package other than the one in which the class is declared». Ser heredero no abre selloDePaquete.
package afuera;

import bodega.Envio;

class HerederoDeOtroPaqueteLeeLoDelPaquete extends Envio {
    HerederoDeOtroPaqueteLeeLoDelPaquete(String codigo) {
        super(codigo);
    }

    int lee() {
        return this.selloDePaquete;
    }
}
