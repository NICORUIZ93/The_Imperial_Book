// tema-3/por-dentro/SumaEncadenada.java — qué genera realmente el compilador para cada forma de unir texto.
// Compilar y desensamblar:
//   javac --release 25 -d out tema-3/por-dentro/SumaEncadenada.java
//   javap -c -p -cp out SumaEncadenada
public class SumaEncadenada {

    /** Un solo «+» con tres operandos: una invocación, no tres objetos intermedios. */
    static String unaVez(String guia, int peso) {
        return guia + "-" + peso + " g";
    }

    /** «+=» en bucle: una invocación nueva por vuelta, con el texto anterior dentro. */
    static String enBucle(int n) {
        String s = "";
        for (int i = 0; i < n; i++) {
            s += "RF-";
        }
        return s;
    }

    /** StringBuilder explícito: un solo objeto acumulado y una sola conversión final. */
    static String conBuilder(int n) {
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < n; i++) {
            b.append("RF-");
        }
        return b.toString();
    }

    /** Constantes puras: aquí no hay ninguna llamada, el compilador deja el texto resuelto. */
    static String todoConstante() {
        return "RF-" + "000" + "123";
    }
}
