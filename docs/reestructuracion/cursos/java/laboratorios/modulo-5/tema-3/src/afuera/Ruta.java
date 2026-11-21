// M5 · Tema 3 · subclase en OTRO paquete: aqui se ve la parte de «protected» que la gente no espera.
// Se compila con el resto. javap -c -p -cp out afuera.Ruta
package afuera;

import bodega.Envio;

public class Ruta extends Envio {

    public Ruta(String codigo) {
        super(codigo);
    }

    // protected + this: el tipo que califica es Ruta, subclase de Envio. §6.6.2.1 lo permite.
    public void sella() {
        hitos.add("sellado");
    }

    public int cuenta() {
        return hitos.size();
    }

    // Mismo nombre y misma firma que el metodo privado de Envio. NO lo sobreescribe: los metodos
    // privados no se heredan (§8.2), asi que esto es un metodo nuevo de Ruta y punto.
    public void comprueba(int nuevo) {
        System.out.println("   afuera: la comprobacion mas estricta de Ruta corre");
        if (nuevo > 30_000) {
            throw new IllegalStateException("peso fuera de contrato: " + nuevo);
        }
    }
}
