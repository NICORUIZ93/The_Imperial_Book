// tema-6/MezclaFlujos.java — dos cosas que el javadoc avisa y aquí se miden:
// 1) java.lang.IO: «After the first call to one of the readln methods, any subsequent use of System.in
//    results in unspecified behavior» (readln monta un decodificador con búfer y puede leer bytes de más).
// 2) Scanner.useDelimiter: «\R» funciona como delimitador entero, pero no dentro de una clase [;\R].
// Ejecutar: javac --release 25 -encoding UTF-8 -d out tema-6/MezclaFlujos.java
//           printf 'primera\nsegunda\ntercera\n' | java -Dstdout.encoding=UTF-8 -cp out MezclaFlujos
import java.util.Scanner;

public class MezclaFlujos {

    public static void main(String[] args) throws Exception {
        System.out.println("stdin.encoding     : " + System.getProperty("stdin.encoding"));

        String una = IO.readln();
        System.out.println("readln() #1        : «" + una + "»");

        // Desde aquí, comportamiento «no especificado»: readln ya montó su decodificador con búfer interno.
        System.out.println("System.in.available: " + System.in.available() + " bytes pendientes en el flujo crudo");
        byte[] crudo = System.in.readNBytes(8);
        System.out.println("readNBytes(8) crudo: " + crudo.length + " bytes");

        String dos = IO.readln();
        System.out.println("readln() #2        : «" + dos + "» · sigue en el búfer de readln, no en System.in");

        System.out.println("--- delimitador con «\\R» suelto, y dentro de una clase ---");
        try (Scanner sc = new Scanner("RF-1;Bogotá;2500\nRF-2;Cali;1001")) {
            sc.useDelimiter(";|\\R");
            System.out.print("tokens con «;|\\R»  : ");
            sc.tokens().limit(4).forEach(t -> System.out.print("«" + t + "» "));
            System.out.println();
        }
        try (Scanner sc = new Scanner("RF-1;Bogotá;2500")) {
            sc.useDelimiter("[;\\R]+");
            System.out.println("nunca llega aquí");
        } catch (RuntimeException e) {
            System.out.println("«[;\\R]+» duele     : " + e.getClass().getName() + ": " + e.getMessage());
        }
    }
}
