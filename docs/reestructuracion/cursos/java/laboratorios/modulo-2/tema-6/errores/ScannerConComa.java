// tema-6/errores/ScannerConComa.java — nextDouble depende del Locale del Scanner, y ese Locale viene de la máquina.
// Ejecutar: javac --release 25 -d out tema-6/errores/ScannerConComa.java
//           java -cp out ScannerConComa
//           java -Duser.language=en -Duser.country=US -cp out ScannerConComa   (invierte el resultado)
import java.util.Locale;
import java.util.Scanner;

public class ScannerConComa {

    public static void main(String[] args) {
        System.out.println("Locale por defecto : " + Locale.getDefault());
        System.out.println("dato a leer        : 2,5 kg (coma, como se escribe aquí)");

        Scanner sc = new Scanner("2,5");
        System.out.println("Scanner sin useLocale usa " + sc.locale());
        double kilos = sc.nextDouble();
        System.out.println("nextDouble()       : " + kilos);
        sc.close();

        System.out.println("--- el mismo dato en una máquina con locale inglés ---");
        Scanner sc2 = new Scanner("2,5");
        sc2.useLocale(Locale.US);
        System.out.println("con useLocale(Locale.US) el separador esperado es «.»:");
        double mal = sc2.nextDouble();
        System.out.println("nextDouble()       : " + mal);
        sc2.close();
    }
}
