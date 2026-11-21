// tema-6/TrampaScanner.java — nextInt deja el salto de línea sin consumir; el nextLine siguiente lee «nada».
// Ejecutar: javac --release 25 -d out tema-6/TrampaScanner.java && java -Dstdout.encoding=UTF-8 -cp out TrampaScanner
import java.util.Scanner;

public class TrampaScanner {

    static final String ENTRADA = "2500 Bogotá\nMedellín\nCali\n";

    public static void main(String[] args) {
        System.out.println("--- como se escribe la primera vez ---");
        Scanner sc = new Scanner(ENTRADA);
        int peso = sc.nextInt();
        String destino = sc.nextLine();
        String siguiente = sc.nextLine();
        System.out.println("nextInt()          : " + peso);
        System.out.println("nextLine() después : «" + destino + "» · longitud " + destino.length());
        System.out.println("nextLine() siguiente: «" + siguiente + "»");
        System.out.println("quedan tokens      : " + sc.hasNextLine());
        sc.close();

        System.out.println("--- arreglo 1: consumir el resto de la línea antes de leer texto ---");
        Scanner sc2 = new Scanner(ENTRADA);
        int peso2 = sc2.nextInt();
        sc2.nextLine();                       // tira « Bogotá» y el salto
        String destino2 = sc2.nextLine();
        System.out.println("nextInt()          : " + peso2);
        System.out.println("nextLine() (descarte) consumió « Bogotá»");
        System.out.println("nextLine() útil    : «" + destino2 + "»");
        sc2.close();

        System.out.println("--- arreglo 2: next() lee un token, no una línea ---");
        Scanner sc3 = new Scanner(ENTRADA);
        System.out.println("next() peso        : " + sc3.next());
        System.out.println("next() ciudad      : " + sc3.next());
        System.out.println("nextLine() resto   : «" + sc3.nextLine() + "»");
        System.out.println("nextLine() siguiente: «" + sc3.nextLine() + "»");
        sc3.close();

        System.out.println("--- delimitador a medida: \\R es cualquier salto de línea ---");
        Scanner sc4 = new Scanner(ENTRADA);
        sc4.useDelimiter("\\R");
        while (sc4.hasNext()) {
            System.out.println("  pieza: «" + sc4.next() + "»");
        }
        System.out.println("hasNextLine tras agotar: " + sc4.hasNextLine());
        sc4.close();
    }
}
