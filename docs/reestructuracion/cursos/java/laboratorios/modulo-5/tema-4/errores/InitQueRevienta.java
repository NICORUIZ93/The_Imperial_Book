// Java · M5 · Tema 4 · error 6 (de ejecucion)
// Si el inicializador de clase revienta, el primer contacto da ExceptionInInitializerError y CUALQUIER
// contacto posterior da NoClassDefFoundError: la clase queda marcada como fallida para toda la JVM.
public class InitQueRevienta {

    static class Rompe {
        static int v = arranque();

        static int arranque() {
            throw new IllegalStateException("no hay configuracion");
        }
    }

    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("primer contacto: " + Rompe.v);      // nunca se imprime
            return;
        }
        try {
            System.out.println("primer contacto: " + Rompe.v);
        } catch (Throwable t) {
            System.out.println("primer contacto: " + t.getClass().getName()
                + " · la causa es " + t.getCause().getClass().getName() + ": " + t.getCause().getMessage());
        }
        System.out.println("segundo contacto: " + Rompe.v);         // el reintento cae distinto
    }
}
