// Java · M5 · Tema 4 · error 8
// Escribir `@Override` sobre un metodo de clase: no hay nada que sustituir, porque un `static` nunca entra
// en la tabla de metodos virtuales del objeto.
public class OverrideDeUnStatic {

    static class Padre {
        static String total() {
            return "padre";
        }
    }

    static class Hijo extends Padre {
        @Override                                  // error: nothing to override
        static String total() {
            return "hijo";
        }
    }

    public static void main(String[] args) {
        System.out.println(Hijo.total());
    }
}
