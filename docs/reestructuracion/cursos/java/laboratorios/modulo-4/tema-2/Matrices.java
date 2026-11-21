// M4 · Tema 2 · Matrices: rectangulares, irregulars y como se recorren de verdad.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Matrices
public class Matrices {

    // Rectangular: dos filas, tres columnas cada una.
    static final int[][] POR_FILA = {
        {1250, 3400, 890},     // Medellin
        {7600, 250, 100}       // Bogota
    };

    // Irregular: cada fila tiene la longitud que le toca.
    static int[][] irregular() {
        int[][] m = new int[3][];     // solo se fijan las FILAS; las columnas quedan null
        m[0] = new int[] {1250, 3400};
        m[1] = new int[] {890};
        m[2] = new int[] {7600, 250, 100, 45};
        return m;
    }

    public static void main(String[] args) {
        System.out.println("longitud de la matriz : " + POR_FILA.length + " filas");
        System.out.println("longitud de la fila 0 : " + POR_FILA[0].length + " columnas");
        System.out.println("longitud de la fila 1 : " + POR_FILA[1].length + " columnas");
        System.out.println("elemento [1][0]       : " + POR_FILA[1][0]);

        System.out.println("recorrido con dos indices:");
        for (int fila = 0; fila < POR_FILA.length; fila++) {
            int suma = 0;
            for (int col = 0; col < POR_FILA[fila].length; col++) {   // la longitud DE LA FILA, no la de la matriz
                suma += POR_FILA[fila][col];
            }
            System.out.println("  fila " + fila + " suma " + suma);
        }

        System.out.println("recorrido con for-each anidado:");
        for (int[] fila : POR_FILA) {          // cada elemento de una matriz es un arreglo
            int suma = 0;
            for (int peso : fila) {
                suma += peso;
            }
            System.out.println("  fila de " + fila.length + " columnas suma " + suma);
        }

        int[][] jagged = irregular();
        System.out.println("irregular: filas " + jagged.length + " · longitudes "
                + jagged[0].length + " " + jagged[1].length + " " + jagged[2].length);

        // Cada fila es un arreglo aparte: cambiar una no cambia la otra.
        POR_FILA[0][0] = 9999;
        System.out.println("tras POR_FILA[0][0] = 9999 -> fila 0: " + POR_FILA[0][0] + " · fila 1: " + POR_FILA[1][0]);

        int[][] copiado = POR_FILA.clone();     // copia SUPERFICIAL: las filas son las mismas objetos
        POR_FILA[0][0] = 1;
        System.out.println("clone es superficial: original[0][0]=" + POR_FILA[0][0]
                + " · copia[0][0]=" + copiado[0][0] + " (misma fila: " + (copiado[0] == POR_FILA[0]) + ")");
    }
}
