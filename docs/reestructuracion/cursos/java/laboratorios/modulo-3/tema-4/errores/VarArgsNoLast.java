// M3 · Tema 4 · los varargs cierran la lista: no pueden ir seguidos de otro parametro.
// Java 25. Ejecuta: javac --release 25 -d out VarArgsNoLast.java   (debe fallar)
// Medido aqui: javac no dice «orden mal definido» ni nada vago. Da el motivo exacto, y uno solo,
// señalando los tres puntos, en la linea 16:
//   tema-4/errores/VarArgsNoLast.java:16: error: varargs parameter must be the last parameter
// La razon de la regla: un llamada como etiqueta("Bogota", 1, 2) tiene que poder repartir los
// argumentos sueltos SIN ambiguedad. Si los varargs no fueran los ultimos, no habria forma de
// saber cuantos argumentos le tocan a cada parametro.
public class VarArgsNoLast {
    // Orden al reves: primero lo fijo, luego los sueltos. Esta SI compila.
    static String etiquetaOk(String ciudad, int... paradas) {
        return ciudad + " con " + paradas.length + " paradas";
    }

    // Asi, no.
    static String etiqueta(String... paradas, String ciudad) { return ciudad; }

    public static void main(String[] args) {
        System.out.println(etiquetaOk("Bogota", 1, 2, 3));
    }
}
