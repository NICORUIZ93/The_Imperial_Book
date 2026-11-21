// tema-6/SinConsola.java — Console solo existe con un terminal de verdad; con la entrada redirigida es null.
// Ejecutar: javac --release 25 -d out tema-6/SinConsola.java
//           java -cp out SinConsola                    (terminal: console no null)
//           java -cp out SinConsola < /dev/null        (redirigido: console null)
import java.io.Console;

public class SinConsola {

    public static void main(String[] args) {
        Console consola = System.console();
        System.out.println("System.console()   : " + consola);

        if (consola == null) {
            System.out.println("no hay terminal: Console es null, y reader()/writer() no se pueden pedir");
            System.out.println("IO.readln() sigue funcionando: «" + IO.readln("guía> ") + "»");
            String leida = IO.readln();
            System.out.println("segunda lectura: «" + leida + "» · null en EOF: " + (leida == null));
            System.out.println("salida por System.out: " + System.out.checkError());
            return;
        }

        System.out.println("attributos         : " + consola.getClass().getName());
        String guia = consola.readLine("guía> ");
        char[] clave = consola.readPassword("clave> ");
        System.out.println("guía               : " + guia);
        System.out.println("clave leída        : " + (clave == null ? 0 : clave.length) + " caracteres (se borran)");
        if (clave != null) {
            java.util.Arrays.fill(clave, ' ');
        }
        consola.writer().format("charset de la consola: %s · es terminal: %s%n",
                consola.charset(), consola.isTerminal());
        consola.flush();
        System.out.println("flush() llamado    : sin consola.flush(), la línea anterior no llega a la pantalla");
    }
}
