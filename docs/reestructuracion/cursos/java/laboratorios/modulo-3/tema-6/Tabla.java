// M3 · Tema 6 · una clase cuyo bloque estatico falla. Ver CausaEncadenada.java.
// Java 25.
public class Tabla {
    static final int[] TRAMOS;
    static {
        int divisor = 0;
        TRAMOS = new int[10 / divisor];   // / by zero en el inicializador de la clase
    }
    static final int DE_FALLO = TRAMOS.length;
}
