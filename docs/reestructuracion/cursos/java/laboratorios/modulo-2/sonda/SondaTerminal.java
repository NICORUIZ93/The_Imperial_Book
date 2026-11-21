// sonda/SondaTerminal.java — diagnóstico de elisión: no es ejemplo de la lección, se compila y se quita.
// Bajo un seudoterminal, ¿qué charset usa IO.readln() y qué bytes devuelve?
import java.io.Console;
public class SondaTerminal {
    public static void main(String[] args) throws Exception {
        System.out.println("stdin.encoding=" + System.getProperty("stdin.encoding")
                + " file.encoding=" + System.getProperty("file.encoding")
                + " native.encoding=" + System.getProperty("native.encoding")
                + " Console=" + System.console()
                + " charset=" + (System.console() == null ? "n/a" : System.console().charset())
                + " locale=" + java.util.Locale.getDefault());
        String s = IO.readln();
        System.out.print("leido: ");
        for (int i = 0; i < s.length();) {
            int cp = s.codePointAt(i);
            System.out.printf("U+%04X ", cp);
            i += Character.charCount(cp);
        }
        System.out.println();
        System.out.println("utf8 de lo leido: " + java.util.Arrays.toString(s.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }
}
