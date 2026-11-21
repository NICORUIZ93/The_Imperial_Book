// M5 · Tema 3 · la clase con los CUATRO niveles de acceso, y el invariante que cada uno protege.
// javac --release 25 -encoding UTF-8 -d out src/bodega/*.java src/afuera/*.java
// java  -Dstdout.encoding=UTF-8 -cp out bodega.Demo
//
// Encapsular no es «poner private»: es decidir cuanto se ve de aqui. Este archivo declara los cuatro
// niveles seguidos para poder compararlos, y cada uno protege una cosa distinta:
//   public    -> la interfaz: lo que otros paquetes pueden leer y escribir
//   protected -> lo que heredan MIS subclases, y solo cuando estan implementando un objeto mio
//   paquete   -> lo que comparte el paquete sin declararse en la API
//   private   -> donde vive el invariante
package bodega;

import java.util.ArrayList;
import java.util.List;

public class Envio {

    public String codigo;                                  // public: parte de la interfaz

    protected final List<String> hitos = new ArrayList<>(); // protected: lo escriben las subclases

    int selloDePaquete = 7;                                 // paquete: sin modificador, lo ve bodega

    private int gramos;                                     // private: el invariante

    public Envio(String codigo) {
        this.codigo = codigo;
        hitos.add("creado");
    }

    public int gramos() {
        return gramos;
    }

    // El unico camino al campo: aqui se rompe el invariante si alguien trae un peso absurdo.
    public void pesar(int nuevo) {
        comprueba(nuevo);
        gramos = nuevo;
    }

    // Privada: no se hereda (§8.2), asi que quien la llama es SIEMPRE este cuerpo, nunca un herede.
    private void comprueba(int nuevo) {
        System.out.println("   bodega: la comprobacion de Envio corre");
        if (nuevo < 0) {
            throw new IllegalStateException("gramos no puede ser negativo: " + nuevo);
        }
    }

    // Version «comoda» del getter: devuelve la lista VIVA del objeto.
    public List<String> hitos() {
        return hitos;
    }

    // Version con copia: lista inmutable, el llamante no puede tocar lo mio.
    public List<String> hitosSeguros() {
        return List.copyOf(hitos);
    }
}
