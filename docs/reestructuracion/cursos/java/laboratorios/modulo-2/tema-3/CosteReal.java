// tema-3/CosteReal.java — el mismo texto construido de cuatro formas, medido con nanoTime.
// Los milisegundos dependen de la máquina y de la JVM; lo que se sostiene de una ejecución a otra es el orden.
// Ejecutar: javac --release 25 -d out tema-3/CosteReal.java && java -Dstdout.encoding=UTF-8 -cp out CosteReal
public class CosteReal {

    static String porMas(int n) {
        String s = "";
        for (int i = 0; i < n; i++) {
            s += "RF-0";
        }
        return s;
    }

    static String porConcat(int n) {
        String s = "";
        for (int i = 0; i < n; i++) {
            s = s.concat("RF-0");
        }
        return s;
    }

    static String porBuilder(int n) {
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < n; i++) {
            b.append("RF-0");
        }
        return b.toString();
    }

    static String porBuilderDimensionado(int n) {
        StringBuilder b = new StringBuilder(n * 4);
        for (int i = 0; i < n; i++) {
            b.append("RF-0");
        }
        return b.toString();
    }

    /** mejor de tres pasadas; el resultado se imprime para que la JVM no pueda tirar el trabajo */
    static void medir(String nombre, java.util.function.IntFunction<String> f, int n) {
        long mejor = Long.MAX_VALUE;
        String ultima = "";
        for (int pasada = 0; pasada < 3; pasada++) {
            long inicio = System.nanoTime();
            ultima = f.apply(n);
            long fin = System.nanoTime();
            if (fin - inicio < mejor) {
                mejor = fin - inicio;
            }
        }
        double ms = Math.round(mejor / 1_000_000.0 * 100) / 100.0;
        System.out.println(nombre + " n=" + n + " : " + ms + " ms · longitud " + ultima.length());
    }

    public static void main(String[] args) {
        // Calentamiento: que el JIT compile antes de la primera medición que se reporta.
        medir("calentamiento          ", CosteReal::porBuilder, 500);
        for (int n : new int[] {2000, 5000, 10000}) {
            medir("+= en bucle          ", CosteReal::porMas, n);
            medir("String.concat        ", CosteReal::porConcat, n);
            medir("StringBuilder        ", CosteReal::porBuilder, n);
            medir("StringBuilder justo  ", CosteReal::porBuilderDimensionado, n);
        }
    }
}
