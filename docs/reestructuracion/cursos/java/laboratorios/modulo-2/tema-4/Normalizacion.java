// tema-4/Normalizacion.java — la misma palabra escrita de dos formas distintas que no son iguales.
// macOS guarda los nombres de archivo descompuestos (NFD); los formularios y las bases de datos suelen venir
// compuestos (NFC). Sin normalizar, comparar textos con acentos es una lotería.
// La tilde combinante se escribe con Character.toString(0x0301) para que el fuente sea legible en cualquier editor.
// Ejecutar: javac --release 25 -d out tema-4/Normalizacion.java && java -Dstdout.encoding=UTF-8 -cp out Normalizacion
import java.text.Normalizer;
import java.util.HashSet;
import java.util.Set;

public class Normalizacion {

    static String hex(int cp) {
        String h = Integer.toHexString(cp).toUpperCase();
        return "0".repeat(Math.max(0, 4 - h.length())) + h;
    }

    static void lista(String nombre, String s) {
        StringBuilder b = new StringBuilder(nombre + " : longitud " + s.length() + " ·");
        s.codePoints().forEach(cp -> b.append(' ').append("U+").append(hex(cp)));
        System.out.println(b);
    }

    public static void main(String[] args) {
        String compuesta = "Bogotá";                                     // á = un code point (U+00E1)
        String descompuesta = "Bogota" + Character.toString(0x0301);      // a + tilde combinante = dos

        lista("compuesta    ", compuesta);
        lista("descompuesta ", descompuesta);

        System.out.println("se ven igual       : «" + compuesta + "» y «" + descompuesta + "»");
        System.out.println("equals             : " + compuesta.equals(descompuesta));
        System.out.println("equalsIgnoreCase   : " + compuesta.equalsIgnoreCase(descompuesta));
        System.out.println("compareTo          : " + compuesta.compareTo(descompuesta));
        System.out.println("hashCode           : " + compuesta.hashCode() + " vs " + descompuesta.hashCode());

        System.out.println("isNormalized NFC   : compuesta " + Normalizer.isNormalized(compuesta, Normalizer.Form.NFC)
                + " · descompuesta " + Normalizer.isNormalized(descompuesta, Normalizer.Form.NFC));
        System.out.println("isNormalized NFD   : compuesta " + Normalizer.isNormalized(compuesta, Normalizer.Form.NFD)
                + " · descompuesta " + Normalizer.isNormalized(descompuesta, Normalizer.Form.NFD));

        String nfc1 = Normalizer.normalize(compuesta, Normalizer.Form.NFC);
        String nfc2 = Normalizer.normalize(descompuesta, Normalizer.Form.NFC);
        System.out.println("normalizadas NFC   : equals " + nfc1.equals(nfc2) + " · longitud " + nfc2.length());
        lista("NFC de la 2  ", nfc2);

        Set<String> destinos = new HashSet<>();
        destinos.add(compuesta);
        System.out.println("contains sin normalizar : " + destinos.contains(descompuesta));
        System.out.println("contains normalizando   : "
                + destinos.contains(Normalizer.normalize(descompuesta, Normalizer.Form.NFC)));

        Set<String> canonicas = new HashSet<>();
        canonicas.add(Normalizer.normalize(descompuesta, Normalizer.Form.NFC));
        System.out.println("clave guardada normalizada, contiene la compuesta: " + canonicas.contains(compuesta));
    }
}
