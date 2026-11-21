// M4 · Tema 3 · El peligro real: un metodo acepta Object[], tu le llevas un String[] y escribe otra cosa.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out EscribeEnObject
import java.util.Arrays;

public class EscribeEnObject {

    // Firma honesta para el metodo: cualquier arreglo de objetos le sirve.
    static void etiquetaTodo(Object[] destino, String prefijo) {
        for (int i = 0; i < destino.length; i++) {
            destino[i] = prefijo + i;
        }
        System.out.println("  dentro del metodo ve un  : " + destino.getClass().getName());
    }

    // Media escritura: lo que ya cabia se guarda, y el arreglo revienta a mitad.
    static void escribeMezcla(Object[] destino) {
        destino[0] = "si-es-string";                 // este SI entra en un String[]
        destino[1] = 42;                             // este NO: ArrayStoreException
        destino[2] = "tampoco llega";
    }

    public static void main(String[] args) {
        String[] guias = new String[3];
        etiquetaTodo(guias, "RF-000");
        System.out.println("afuera, ya convertido     : " + Arrays.toString(guias));

        Object[] mixto = new Object[3];
        etiquetaTodo(mixto, "L-");
        mixto[1] = 7;                                // en Object[] un Integer entra sin avisar
        System.out.println("Object[] con un Integer   : " + mixto[1] + " de " + mixto[1].getClass().getSimpleName());
        try {
            String texto = (String) mixto[1];        // el error LLEGA TARDE: al leer
            System.out.println("  esta linea no se ejecuta  : " + texto);
        } catch (ClassCastException e) {
            System.out.println("  el error aparece al leer  : " + e.getClass().getSimpleName()
                    + " · " + e.getMessage());
        }

        try {
            escribeMezcla(guias);
        } catch (ArrayStoreException e) {
            System.out.println("arreglo a medio escribir  : " + e.getClass().getSimpleName()
                    + " · " + e.getMessage());
            System.out.println("  el indice 0 SI cambio   : " + guias[0]);
            System.out.println("  el resto quedo viejo    : " + guias[1] + " · " + guias[2]);
        }

        Integer[] numericos = {1, 2, 3};
        try {
            Object[] vista = numericos;
            vista[0] = "uno";                        // mismo intento, ahora sobre Integer[]
        } catch (ArrayStoreException e) {
            System.out.println("sobre Integer[] falla ya  : " + e.getClass().getSimpleName()
                    + " · el indice 0 sigue siendo " + numericos[0].getClass().getSimpleName());
        }
    }
}
