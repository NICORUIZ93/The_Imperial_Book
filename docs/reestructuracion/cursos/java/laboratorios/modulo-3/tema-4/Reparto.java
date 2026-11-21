// M3 · Tema 4 · varargs: dentro del metodo es un arreglo normal, y eso trae dos consecuencias.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Reparto
public class Reparto {
    static int totalCajas(int... pesos) { // un int[], no una coleccion magica
        int s = 0;
        for (int p : pesos) s += p;
        return s;
    }

    // Consecuencia 1: cada llamada con elementos sueltos construye un arreglo nuevo.
    static int selloDeArreglo(int... pesos) {
        return System.identityHashCode(pesos);
    }

    // Consecuencia 2: si le pasas TU arreglo, no se copia: el metodo muda tus casillas.
    static void pisaPrimera(int... pesos) { pesos[0] = -1; }

    // varargs tiene que ser lo ultimo; y puede recibir cero argumentos.
    static String etiqueta(String ciudad, int... paradas) {
        return ciudad + " con " + paradas.length + " paradas";
    }

    public static void main(String[] args) {
        System.out.println("totalCajas(1250, 3400, 890) = " + totalCajas(1250, 3400, 890));
        int[] tanda = {1250, 3400};
        System.out.println("totalCajas(tanda)           = " + totalCajas(tanda));
        System.out.println("totalCajas()                = " + totalCajas());

        int a = selloDeArreglo(1, 2);
        int b = selloDeArreglo(1, 2);
        System.out.println("dos llamadas iguales crean arreglos distintos: " + (a != b));

        int[] mias = {500, 600};
        pisaPrimera(mias);
        System.out.println("tras pisaPrimera(mias), mias[0] = " + mias[0]);

        System.out.println(etiqueta("Bogota"));
        System.out.println(etiqueta("Bogota", 1, 2, 3));
    }
}
