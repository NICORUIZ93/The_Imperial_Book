// M0 · Tema 6 · ejemplo mínimo para el primer punto de parada: una variable que cambia en cada vuelta.
// Java 25. Ejecuta: java Contador.java
public class Contador {
    public static void main(String[] args) {
        int paquetes = 0;
        for (int vuelta = 1; vuelta <= 3; vuelta++) {
            paquetes = paquetes + vuelta;
        }
        System.out.println("paquetes cargados: " + paquetes);
    }
}
