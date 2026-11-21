// M3 · Tema 6 · depurar con metodo en vez de adivinar: reproducir, particionar, comprobar.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out DepuraConMetodo
public class DepuraConMetodo {
    static int desglosa(String[] guias, int desde, int hasta) {
        int total = 0;
        for (int i = desde; i < hasta; i++) total += Integer.parseInt(guias[i]);
        return total;
    }

    // Paso 1: una funcion que dice si un trozo esta bien, sin lanzar.
    static boolean trozoMalo(String[] guias, int desde, int hasta) {
        try { desglosa(guias, desde, hasta); return false; }
        catch (NumberFormatException e) { return true; }
    }

    // Paso 2: particionar por mitades. Con 8 entradas malformadas se localiza la primera en 3 rondas,
    // no probando las 8 una por una.
    static int rondas = 0;

    static int primerIndiceMalo(String[] guias) {
        rondas = 0;
        int lo = 0, hi = guias.length;
        while (hi - lo > 1) {
            rondas++;
            int medio = (lo + hi) / 2;
            if (trozoMalo(guias, lo, medio)) hi = medio; else lo = medio;
        }
        return lo;
    }

    // Paso 3: confirmar con la excepcion concreta, que ya trae la cadena culpable en el mensaje.
    static void confirmar(String[] guias, int i) {
        try {
            Integer.parseInt(guias[i]);
            System.out.println("  el indice " + i + " esta limpio");
        } catch (NumberFormatException e) {
            System.out.println("  el indice " + i + " es el culpable: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        String[] guias = {"1250", "3400", "890", "7600", "250", "1900", "sin peso", "4300"};
        int culpable = primerIndiceMalo(guias);
        System.out.println("entradas: " + guias.length + " · localizadas en " + rondas + " rondas");
        System.out.println("primer indice sospechoso: " + culpable);
        confirmar(guias, culpable);

        // Y si quieres ver la pila sin que exista un error, se pide:
        for (StackTraceElement marco : Thread.currentThread().getStackTrace()) {
            if (marco.getMethodName().equals("main")) System.out.println("  marco: " + marco);
        }
    }
}
