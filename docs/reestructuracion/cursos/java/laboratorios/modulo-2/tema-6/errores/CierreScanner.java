// tema-6/errores/CierreScanner.java — cerrar un Scanner de System.in cierra System.in: ya no hay segunda lectura.
// Ejecutar: javac --release 25 -d out tema-6/errores/CierreScanner.java
//           printf 'RF-000123\nRF-000456\n' | java -Dstdout.encoding=UTF-8 -cp out CierreScanner
import java.util.Scanner;

public class CierreScanner {

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        String primera = sc.nextLine();
        System.out.println("primera con Scanner: «" + primera + "»");
        sc.close();
        System.out.println("scanner cerrado    : close() cierra también el flujo que le dieron (System.in)");

        String segunda = IO.readln();
        System.out.println("segunda con IO      : «" + segunda + "»");
    }
}
