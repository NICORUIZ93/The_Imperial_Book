// Java · M5 · Tema 5 · error 20 (segunda mitad): el MISMO fuente, con `-sourcepath` apuntando a su carpeta
// Ahora `bodega/A.java` queda fuera del camino de fuentes: el paquete no existe para javac.
package usa;

import bodega.A;

public class Usa {
    public static void main(String[] args) {
        System.out.println("fuente encontrada    : " + A.dime());
    }
}
