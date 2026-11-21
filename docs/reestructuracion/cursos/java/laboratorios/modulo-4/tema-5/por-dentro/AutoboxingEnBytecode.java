// M4 · Tema 5 · Por dentro · El autoboxing NO es un "new": es una llamada a valueOf, y por eso usa la cache.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out AutoboxingEnBytecode
// Y miralo: javac -d out2 AutoboxingEnBytecode.java && javap -c -p -cp out2 AutoboxingEnBytecode
public class AutoboxingEnBytecode {

    static Integer empaca(int v) {
        Integer caja = v;                         // invokestatic Integer.valueOf:(I)Ljava/lang/Integer;
        return caja;
    }

    static int saca(Integer caja) {
        int suelto = caja;                        // invokevirtual Integer.intValue:()I
        return suelto;
    }

    static Integer sumaDos(Integer a, Integer b) {
        return a + b;                             // dos intValue, un valueOf del resultado
    }

    static Integer forzadoNuevo(int v) {
        return new Integer(v);                    // new + invokespecial <init>: SI aparece el "new"
    }

    public static void main(String[] args) {
        System.out.println("empaca(127)  es caja   : " + empaca(127) + " · misma que valueOf: "
                + (empaca(127) == Integer.valueOf(127)));
        System.out.println("empaca(128)  es caja   : " + empaca(128) + " · misma que valueOf: "
                + (empaca(128) == Integer.valueOf(128)));
        System.out.println("saca(valueOf)          : " + saca(Integer.valueOf(3400)));
        System.out.println("sumaDos(1250, 3400)    : " + sumaDos(1250, 3400));
        System.out.println("new Integer(30)        : " + forzadoNuevo(30)
                + " · NO es la cache: " + (forzadoNuevo(30) == Integer.valueOf(30)));
    }
}
