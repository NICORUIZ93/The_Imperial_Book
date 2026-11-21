// Java · M5 · Tema 4 · error 4
// Un metodo de clase no se SUSTITUYE: o se oculta con otro `static`, o el compilador lo corta.
public class InstanceOverrideDeStatic {

    static class Padre {
        static String total() {
            return "padre";
        }
    }

    static class Hijo extends Padre {
        String total() {               // error: instance method cannot override static method
            return "hijo";
        }
    }

    public static void main(String[] args) {
        System.out.println(new Hijo().total());
    }
}
