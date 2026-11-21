// M4 · Tema 2 · La clase Arrays: ordenar, copiar, rellenar, comparar, imprimir y buscar.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out UsosDeArrays
import java.util.Arrays;

public class UsosDeArrays {
    public static void main(String[] args) {
        int[] pesos = {7600, 250, 1250, 890, 3400};
        System.out.println("antes  : " + Arrays.toString(pesos));
        Arrays.sort(pesos);
        System.out.println("ordenado: " + Arrays.toString(pesos));

        // Buscar sobre el arreglo YA ordenado.
        System.out.println("binarySearch(890)  : " + Arrays.binarySearch(pesos, 890));
        System.out.println("binarySearch(1250) : " + Arrays.binarySearch(pesos, 1250));

        // Lo que no esta: sale NEGATIVO, y codifica donde deberia ir.
        int noEsta = Arrays.binarySearch(pesos, 1000);
        System.out.println("binarySearch(1000) : " + noEsta
                + " · deberia ir en el indice " + (-noEsta - 1));

        // Copiar: copyOf ajusta la longitud, copyOfRange recorta un trozo.
        int[] crecido = Arrays.copyOf(pesos, 7);
        int[] recortado = Arrays.copyOfRange(pesos, 1, 3);
        System.out.println("copyOf(...,7)      : " + Arrays.toString(crecido));
        System.out.println("copyOfRange(1,3)   : " + Arrays.toString(recortado) + " · length " + recortado.length);

        // Rellenar: toda la longitud, o un rango.
        Arrays.fill(crecido, 5, 7, 42);
        System.out.println("fill(5,7,42)       : " + Arrays.toString(crecido));

        // Comparar: equals compara contenido elemento a elemento; == compara identidad.
        int[] gemelo = {250, 890, 1250, 3400, 7600};
        System.out.println("igualdad: == " + (pesos == gemelo) + " · equals " + Arrays.equals(pesos, gemelo)
                + " · equals del propio " + Arrays.equals(pesos, pesos));
        System.out.println("primeros 2 iguales: " + Arrays.equals(pesos, 0, 2, gemelo, 0, 2));
        System.out.println("mismatch           : " + Arrays.mismatch(pesos, gemelo) + " ( -1 = no difiere en nada)");

        // Matrices: toString e equals solo ven la primera capa; hacen falta las versiones "deep".
        int[][] m = {{1, 2}, {3, 4}};
        int[][] n = {{1, 2}, {3, 4}};
        String capa1 = Arrays.toString(m);      // lleva direcciones de memoria: no se imprime entero
        System.out.println("toString            : empieza '" + capa1.substring(0, 3) + "' y tiene '@' "
                + (capa1.contains("@") ? "si" : "no") + " · " + (capa1.split(",").length) + " trozos");
        System.out.println("deepToString        : " + Arrays.deepToString(m));
        System.out.println("equals / deepEquals : " + Arrays.equals(m, n) + " / " + Arrays.deepEquals(m, n));

        // asList: vista del arreglo, no copia. Lo que se cambia es el ORIGINAL.
        String[] zonas = {"Medellin", "Bogota", "Cali"};
        java.util.List<String> vista = Arrays.asList(zonas);
        vista.set(0, "Envigado");
        System.out.println("tras vista.set(0)   : arreglo " + Arrays.toString(zonas) + " · vista " + vista);
    }
}
