// tema-6/ScannerArchivo.java — el mismo Scanner, pero sobre un archivo y con el charset dicho en voz alta.
// Ejecutar: javac --release 25 -d out tema-6/ScannerArchivo.java
//           java -Dstdout.encoding=UTF-8 -cp out ScannerArchivo tema-6/datos/guias.txt
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

public class ScannerArchivo {

    // El «throws Exception» es un salvoconducto: leer archivos puede fallar, y las excepciones se explican en su módulo.
    public static void main(String[] args) throws Exception {
        Path archivo = Path.of(args.length > 0 ? args[0] : "tema-6/datos/guias.txt");
        System.out.println("archivo            : " + archivo + " · existe " + Files.exists(archivo)
                + " · " + Files.size(archivo) + " bytes");

        System.out.println("--- Scanner sobre el archivo, UTF-8 explícito ---");
        try (Scanner sc = new Scanner(archivo, StandardCharsets.UTF_8)) {
            sc.useLocale(Locale.forLanguageTag("es-CO"));
            int n = 0;
            while (sc.hasNextLine()) {
                n++;
                String linea = sc.nextLine();
                System.out.println("  " + n + " «" + linea.strip() + "» · " + linea.codePointCount(0, linea.length())
                        + " code points");
            }
            System.out.println("líneas leídas      : " + n);
        }

        System.out.println("--- el mismo archivo, partido por split, con Files.readString ---");
        String todo = Files.readString(archivo, StandardCharsets.UTF_8);
        System.out.println("readString         : " + todo.length() + " char · "
                + todo.codePointCount(0, todo.length()) + " code points · "
                + todo.lines().count() + " líneas");
        String[] lineas = todo.split("\\R");
        System.out.println("split(\\R)          : " + lineas.length + " piezas");
        for (String l : lineas) {
            if (!l.isBlank()) {
                String[] campos = l.strip().split(";");
                System.out.println("  " + String.format("%-11s %-12s %s", campos[0], campos[1], campos[2]));
            }
        }

        System.out.println("--- leído SIN decir el charset (depende de la máquina) ---");
        try (Scanner sc = new Scanner(archivo)) {
            System.out.println("  primera línea    : «" + sc.nextLine() + "»");
            System.out.println("  Locale usado     : " + sc.locale()
                    + " (Scanner no expone su charset; solo se lo puedes dar tú)");
        }
    }
}
