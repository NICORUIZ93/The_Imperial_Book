// M3 · Tema 6 · una traza puede tener varias causas: «Caused by» es el origen real.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out CausaEncadenada
// El segundo acceso a la clase NO repite la excepcion original: la JVM ya marco la clase como
// «fallida al inicializar» y de aqui en adelante da NoClassDefFoundError, sin la causa dentro.
public class CausaEncadenada {
    public static void main(String[] args) {
        try {
            System.out.println("primer acceso: " + Tabla.DE_FALLO);
        } catch (Throwable t) {
            System.out.println("capturado en el primer acceso: " + t.getClass().getName());
            t.printStackTrace(System.out);
        }
        try {
            System.out.println("segundo acceso: " + Tabla.DE_FALLO);
        } catch (Throwable t) {
            System.out.println("capturado en el segundo acceso: " + t.getClass().getName() + " -> " + t.getMessage());
        }
    }
}
