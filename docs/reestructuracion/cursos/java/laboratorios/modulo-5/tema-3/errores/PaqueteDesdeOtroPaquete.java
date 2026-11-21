// M5 · Tema 3 · error 2 de 6: sin modificador NO es «publicito», es de paquete y la barrera es real.
// javac --release 25 -d out -cp /tmp/t3out errores/PaqueteDesdeOtroPaquete.java
package afuera;

import bodega.Envio;

class PaqueteDesdeOtroPaquete {
    int lee(Envio e) {
        return e.selloDePaquete;
    }
}
