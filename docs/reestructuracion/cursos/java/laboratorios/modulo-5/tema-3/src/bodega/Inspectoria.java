// M5 · Tema 3 · otra clase del MISMO paquete: para ella, lo de acceso de paquete es tan abierto
// como lo public. Esto es lo que «paquete» significa: no es una barrera de archivo, es una de paquete.
// Se compila con el resto (src/bodega/*.java) y la llama Demo.
package bodega;

class Inspectoria {

    static String informe(Envio e) {
        // Lee y ESCRIBE el campo de paquete: el modificador ausente permite las dos cosas dentro de bodega.
        e.selloDePaquete = e.selloDePaquete + 1;
        return "sello de paquete leido y escrito desde bodega: " + e.selloDePaquete;
    }

    static String porFuera(Envio e) {
        // El privado de Envio NO se ve aqui aunque estemos en el mismo paquete y en el mismo proyecto.
        // Esta clase solo puede usar la puerta publica: el getter.
        return "gramos por la puerta publica desde otra clase del paquete: " + e.gramos();
    }
}
