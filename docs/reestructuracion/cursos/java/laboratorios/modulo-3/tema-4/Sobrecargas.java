// M3 · Tema 4 · como elige Java la sobrecarga cuando varias encajan.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Sobrecargas
public class Sobrecargas {
    // Cuatro firmas que podrian valer. Cada una dice cual es, para ver cual se elige.
    static String fase(int i)      { return "int"; }
    static String fase(long l)     { return "long"; }
    static String fase(Integer i)  { return "Integer"; }
    static String fase(int... is)  { return "int..."; }

    // Sin la coincidencia exacta delante, el orden real es: ensanchar gana a embolsar.
    static String orden(long l)     { return "ensanchado"; }
    static String orden(Integer i)  { return "embolsado"; }

    // Y embolsar gana a varargs.
    static String ultima(Integer i)  { return "embolsado"; }
    static String ultima(int... is)  { return "varargs"; }

    // Entre tipos referencia, elige el mas especifico. null no es un int: no compite.
    static String nulo(String s)    { return "String"; }
    static String nulo(Object o)    { return "Object"; }
    static String nulo(CharSequence c) { return "CharSequence"; }

    public static void main(String[] args) {
        System.out.println("fase(5)                -> " + fase(5) + "   (la exacta, con las otras tres esperando)");
        System.out.println("fase(5L)               -> " + fase(5L));
        System.out.println("fase(Integer.valueOf(5)) -> " + fase(Integer.valueOf(5)));
        System.out.println("fase(5, 6)             -> " + fase(5, 6) + "   (no hay firma de dos int)");
        System.out.println("orden(5)           -> " + orden(5));
        System.out.println("ultima(5)          -> " + ultima(5));
        System.out.println("nulo(null)         -> " + nulo(null));
        System.out.println("nulo(\"RF-1\")        -> " + nulo("RF-1"));
    }
}
