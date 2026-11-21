// tema-1/PoolDeLiterales.java — dónde vive cada `String` y qué compara `==`.
// Ejecutar: javac --release 25 -d out PoolDeLiterales.java && java -cp out PoolDeLiterales
public class PoolDeLiterales {

    static String literalDeCampo = "RF-000123";

    public static void main(String[] args) {
        String a = "RF-000123";                                  // literal: va al pool
        String b = "RF-000123";                                  // mismo literal: reutiliza el del pool
        String c = new String("RF-000123");                       // objeto nuevo, fuera del pool
        String d = "RF-000" + "123";                              // expresión constante: el compilador la dobla
        String e = nuevo("RF-000", "123");                        // concatenación en tiempo de ejecución
        String f = literalDeCampo;

        System.out.println("a == b            : " + (a == b));
        System.out.println("a == d            : " + (a == d));
        System.out.println("a == f            : " + (a == f));
        System.out.println("a == c            : " + (a == c));
        System.out.println("a == e            : " + (a == e));
        System.out.println("a.equals(c)       : " + a.equals(c));
        System.out.println("a.equals(e)       : " + a.equals(e));
        System.out.println("a == c.intern()   : " + (a == c.intern()));
        System.out.println("a == e.intern()   : " + (a == e.intern()));
        System.out.println("longitud          : " + a.length());
    }

    static String nuevo(String x, String y) {
        return new StringBuilder(x).append(y).toString();
    }
}
