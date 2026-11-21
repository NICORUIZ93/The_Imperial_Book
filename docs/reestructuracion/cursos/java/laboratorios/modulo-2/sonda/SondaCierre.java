// sonda/SondaCierre.java — comprueba, en una sola corrida, las cinco afirmaciones del cierre del módulo 2.
// Ejecutar: java --release 25 sonda/SondaCierre.java   (o javac --release 25 -d out y java -cp out SondaCierre)
import java.util.Locale;

public class SondaCierre {
    public static void main(String[] args) {
        String sucia = "  ruta\tflow　 ";
        System.out.println("longitud original: " + sucia.length());
        System.out.println("trim()           : " + sucia.trim().length() + " · code points "
                + sucia.trim().codePointCount(0, sucia.trim().length()));
        System.out.println("strip()          : " + sucia.strip().length() + " · code points "
                + sucia.strip().codePointCount(0, sucia.strip().length()));

        System.out.println("lines() \\r\\n     : " + "a\r\nb\r\nc".lines().count());

        System.out.printf("|%%-3s|          : |%-3s|%n", "a");
        System.out.printf("|%%3s|           : |%3s|%n", "a");

        // Las dos líneas siguientes son deliberadamente redundantes: la primera usa el constructor obsoleto.
        // javac -Xlint:deprecation avisa: «[deprecation] Locale(String,String) in Locale has been deprecated».
        System.out.println("locale con ctor obsoleto : " + String.format(new Locale("es", "CO"), "%,.2f", 11400.0));
        System.out.println("forLanguageTag es-CO     : "
                + String.format(Locale.forLanguageTag("es-CO"), "%,.2f", 11400.0));
        System.out.println("forLanguageTag en-US     : "
                + String.format(Locale.forLanguageTag("en-US"), "%,.2f", 11400.0));
        System.out.println("locale US                : " + String.format(Locale.US, "%,.2f", 11400.0));

        String s = "Bogotá";
        String s2 = "Bog" + "otá";
        System.out.println("\"Bog\"+\"otá\" ==  : " + (s == s2));

        System.out.println("emoji cp         : " + "📦 RF-000999".codePointCount(0, "📦 RF-000999".length())
                + " · length " + "📦 RF-000999".length());
    }
}
