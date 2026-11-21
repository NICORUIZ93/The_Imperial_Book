// M5 · Tema 3 · error 1 de 6: el private NO se relaja por estar en el mismo paquete.
// javac --release 25 -d out -cp /tmp/t3out errores/PrivadoEnOtraClaseDelPaquete.java
// Sale de la misma clase de la que hablamos: bodega.Inspectoria esta en bodega, y aun asi no puede.
package bodega;

class PrivadoEnOtraClaseDelPaquete {
    int lee(Envio e) {
        return e.gramos;
    }
}
