// Java · M5 · Tema 5 · error 20 (primera mitad): en el arbol correcto
// `-sourcepath arbol/bien` le dice a javac donde buscar las fuentes que no le diste en la linea de ordenes.
package usa;

import bodega.A;

public class Usa {
    public static void main(String[] args) {
        System.out.println("fuente encontrada    : " + A.dime());
    }
}
