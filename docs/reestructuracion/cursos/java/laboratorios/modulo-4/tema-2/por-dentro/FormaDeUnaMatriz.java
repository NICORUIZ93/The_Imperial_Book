// M4 · Tema 2 · Por dentro · Una matriz es un arreglo cuyas filas son OTROS arreglos.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out FormaDeUnaMatriz
// Y miralo en bytecode: javac -d out2 FormaDeUnaMatriz.java && javap -c -p -cp out2 FormaDeUnaMatriz
public class FormaDeUnaMatriz {

    static int[][] rectangular() {
        return new int[2][3];      // multianewarray: una sola instruccion para las dos dimensiones
    }

    static int[][] filaPorFila() {
        int[][] m = new int[2][];  // newarray/anewarray de las filas + cada fila creada aparte
        m[0] = new int[3];
        m[1] = new int[3];
        return m;
    }

    public static void main(String[] args) {
        int[][] r = rectangular();
        int[][] f = filaPorFila();

        System.out.println("clase de int[][]     : " + r.getClass().getName() + " · filas " + r.length);
        System.out.println("clase de una fila    : " + r[0].getClass().getName() + " · columnas " + r[0].length);
        System.out.println("componente del entero: " + r.getClass().getComponentType().getName());
        System.out.println("componente de la fila: " + r[0].getClass().getComponentType());

        // Las dos matrices tienen la MISMA clase aunque se crearon con instrucciones distintas.
        System.out.println("misma clase?         : " + (r.getClass() == f.getClass()));

        // Una matriz JAMAS es un bloque de memoria continuo de 2 x 3: son 1 arreglo + 2 arreglos.
        int[] primeraFila = r[0];
        primeraFila[0] = 9999;
        System.out.println("cambiar la fila fuera: r[0][0] = " + r[0][0]);

        // Y cada fila puede ser de otra longitud: eso es la matriz irregular.
        int[][] irregular = new int[2][];
        irregular[0] = new int[3];
        irregular[1] = new int[7];
        System.out.println("irregular en columnas: " + irregular[0].length + " y " + irregular[1].length
                + " · misma clase: " + (irregular[0].getClass() == irregular[1].getClass()));
    }
}
