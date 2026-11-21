// M3 · Tema 6 · leer una traza de arriba abajo y de abajo arriba: el orden engana.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Trazas
// La convencion de la traza: la PRIMERA linea «at» es el marco mas nuevo (donde se paro el hilo),
// y la ULTIMA es la llamada de main. El fallo casi nunca esta en la primera linea.
public class Trazas {
    static int reparte(String[] guias, int i) {
        int peso = Integer.parseInt(guias[i]);      // aqui revienta: la cadena no es un numero
        return peso / 1000;
    }

    static int tanda(String[] guias) {
        int total = 0;
        for (int i = 0; i < guias.length; i++) total += reparte(guias, i);
        return total;
    }

    public static void main(String[] args) {
        String[] guias = {"1250", "3400", "sin peso"};
        System.out.println("tanda: " + tanda(guias));
    }
}
