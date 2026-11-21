// tema-5/Tabla.java — una tabla alineada: el ancho se calcula con los datos, no se escribe a mano.
// Ejecutar: javac --release 25 -d out tema-5/Tabla.java && java -Dstdout.encoding=UTF-8 -cp out Tabla
import java.util.Formatter;
import java.util.Locale;

public class Tabla {

    static final Locale ES = Locale.forLanguageTag("es-CO");

    static final String[][] ENVIOS = {
        {"RF-000123", "Bogotá", "2500", "11400.00"},
        {"RF-000456", "Medellín", "1800", "9600.00"},
        {"RF-000789", "Cali", "1001", "7300.50"},
    };

    /** Ancho en code points de cada columna: ni en bytes ni en char. */
    static int[] anchos(String[][] filas, String[] cabecera) {
        int[] a = new int[cabecera.length];
        for (int c = 0; c < cabecera.length; c++) {
            a[c] = ancho(cabecera[c]);
            for (String[] fila : filas) {
                a[c] = Math.max(a[c], ancho(fila[c]));
            }
        }
        return a;
    }

    static int ancho(String s) {
        return s.codePointCount(0, s.length());
    }

    static String lineaSeparador(int[] a) {
        StringBuilder b = new StringBuilder();
        for (int n : a) {
            if (b.length() > 0) {
                b.append("  ");
            }
            b.append("-".repeat(n));
        }
        return b.toString();
    }

    public static void main(String[] args) {
        String[] cabecera = {"guía", "destino", "peso", "costo"};
        int[] a = anchos(ENVIOS, cabecera);
        System.out.print("anchos por columna (code points):");
        for (int n : a) {
            System.out.print(" " + n);
        }
        System.out.println();

        // La plantilla se arma con los anchos medidos: %1$-*s no existe en Java, se concatena la plantilla.
        String plantilla = "%-" + a[0] + "s  %-" + a[1] + "s  %" + a[2] + "s  %" + a[3] + "s%n";
        System.out.printf(plantilla, "guía", "destino", "peso", "costo");
        String separador = lineaSeparador(a);
        System.out.println(separador);
        double total = 0;
        for (String[] e : ENVIOS) {
            System.out.printf(plantilla, e[0], e[1], e[2], String.format(ES, "%,.2f", Double.parseDouble(e[3])));
            total += Double.parseDouble(e[3]);
        }
        System.out.println(separador);
        System.out.printf(plantilla, "", "", "TOTAL", String.format(ES, "%,.2f", total));

        System.out.println("--- el ancho es mínimo, no máximo ---");
        System.out.printf("|%-8s|%n", "Bogotá");
        System.out.printf("|%-8s|%n", "San Cristóbal");
        System.out.println("la segunda desborda: %-8s garantiza 8 como mínimo");

        System.out.println("--- y el ancho cuenta unidades UTF-16, no code points ---");
        String conEmoji = "📦 Bogotá"; // 9 unidades UTF-16, 8 code points
        System.out.println("longitud " + conEmoji.length() + " · code points "
                + conEmoji.codePointCount(0, conEmoji.length()));
        System.out.printf("|%-11s|%n", conEmoji);
        System.out.printf("|%-11s|%n", "Bogotá centro");

        System.out.println("--- mismo formato, escrito en un StringBuilder en vez de ir a pantalla ---");
        StringBuilder salida = new StringBuilder();
        try (Formatter f = new Formatter(salida, ES)) {
            for (String[] e : ENVIOS) {
                f.format("%s · %s · %,.2f%n", e[0], e[1], Double.parseDouble(e[3]));
            }
            f.format("TOTAL · %,.2f%n", total);
        }
        System.out.print(salida);
        System.out.println("caracteres acumulados en el builder: " + salida.length());
    }
}
