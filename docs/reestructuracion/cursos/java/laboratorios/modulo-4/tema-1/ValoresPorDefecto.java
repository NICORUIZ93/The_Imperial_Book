// M4 · Tema 1 · Que hay en un arreglo nuevo, antes de escribir nada en el.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out ValoresPorDefecto
public class ValoresPorDefecto {

    static String pinta(char c) {
        // El caracter por defecto es el cero de UTF-16: no se ve, hay que nombrarlo.
        return "u+00" + Integer.toHexString(c) + " (" + (c == 0 ? "cero" : "no cero") + ")";
    }

    public static void main(String[] args) {
        int[] gramos = new int[3];
        long[] distancia = new long[2];
        double[] importe = new double[2];
        boolean[] urgente = new boolean[2];
        char[] iniciales = new char[2];
        String[] guias = new String[2];

        System.out.println("int    [3]: " + gramos[0] + " " + gramos[1] + " " + gramos[2]
                + " · su clase es " + gramos.getClass());
        System.out.println("long   [2]: " + distancia[0] + " " + distancia[1]);
        System.out.println("double [2]: " + importe[0] + " " + importe[1]);
        System.out.println("boolean[2]: " + urgente[0] + " " + urgente[1]);
        System.out.println("char   [2]: " + pinta(iniciales[0]) + " · " + pinta(iniciales[1]));
        System.out.println("String [2]: " + guias[0] + " · " + guias[1] + " · componente "
                + guias.getClass().getComponentType());

        // Los cuatro ceros son distintos tipos de cero: 0, 0L, 0.0, false, el caracter 0 y la referencia null.
        System.out.println("0 == false ? no compila; 0.0 == 0 ? " + (0.0 == 0) + "; null == null ? " + (null == null));

        // Escribir en una posicion no borra las demas: el arreglo entero sigue existiendo.
        gramos[1] = 3400;
        System.out.println("tras gramos[1] = 3400: " + gramos[0] + " " + gramos[1] + " " + gramos[2]
                + " · suma " + (gramos[0] + gramos[1] + gramos[2]));
    }
}
