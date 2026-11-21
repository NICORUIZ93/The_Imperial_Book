// M4 · Tema 3 · Por dentro · Guardar referencias es UNA instruccion sin tipo; los generics no existen en el bytecode.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out UnaInstruccionParaGuardar
// Y miralo: javac -d out2 UnaInstruccionParaGuardar.java && javap -c -p -cp out2 UnaInstruccionParaGuardar
import java.util.ArrayList;
import java.util.List;

public class UnaInstruccionParaGuardar {

    static void guardaReferencia(Object[] destino, Object valor) {
        destino[0] = valor;                // aastore: NO dice que tipo; el chequeo es de la JVM al ejecutar
    }

    static void guardaPrimitivo(int[] destino, int valor) {
        destino[0] = valor;                // iastore: aqui SI hay un tipo fijo en la instruccion
    }

    static List<String> llenaLista() {
        List<String> guias = new ArrayList<>();
        guias.add("RF-000123");            // invokeinterface List.add:(Ljava/lang/Object;)Z  <- sin String
        guias.add("RF-000124");
        return guias;
    }

    public static void main(String[] args) {
        String[] guias = new String[2];
        guardaReferencia(guias, "RF-000001");
        System.out.println("guardado legal         : " + guias[0]);
        try {
            guardaReferencia(guias, 7);
        } catch (ArrayStoreException e) {
            System.out.println("guardado ilegal        : " + e.getClass().getSimpleName());
        }

        int[] pesos = new int[2];
        guardaPrimitivo(pesos, 1250);
        System.out.println("primitivo guardado     : " + pesos[0]);

        System.out.println("lista declarada String : " + llenaLista().size() + " elementos");
        System.out.println("clase de la lista      : " + llenaLista().getClass().getName());
    }
}
