// tema-4/CodePoints.java — «char» no es un carácter: es una unidad de código UTF-16 de 16 bits.
// Ejecutar: javac --release 25 -d out tema-4/CodePoints.java && java -Dstdout.encoding=UTF-8 -cp out CodePoints
public class CodePoints {

    static final String ETIQUETA = "📦 RF-000123 · Bogotá";

    /** U+xxxx en mayúsculas, sin printf (eso es el tema 5). */
    static String hex(int cp) {
        String h = Integer.toHexString(cp).toUpperCase();
        while (h.length() < 4) {
            h = "0" + h;
        }
        return "U+" + h;
    }

    /** Prefijo con como máximo «max» code points, sin partir un par sustituto. */
    static String prefijoSeguro(String s, int max) {
        int conte = s.codePointCount(0, s.length());
        if (conte <= max) {
            return s;
        }
        return s.substring(0, s.offsetByCodePoints(0, max));
    }

    public static void main(String[] args) {
        System.out.println("etiqueta            : " + ETIQUETA);
        System.out.println("length()            : " + ETIQUETA.length() + " (unidades UTF-16)");
        System.out.println("codePointCount      : " + ETIQUETA.codePointCount(0, ETIQUETA.length()) + " (caracteres)");
        System.out.println("chars().count()     : " + ETIQUETA.chars().count());
        System.out.println("codePoints().count(): " + ETIQUETA.codePoints().count());

        System.out.println("--- los dos primeros caracteres reales ---");
        int cp0 = ETIQUETA.codePointAt(0);
        System.out.println("codePointAt(0)      : " + hex(cp0) + " · " + new String(Character.toChars(cp0))
                + " · ocupa " + Character.charCount(cp0) + " char");
        System.out.println("charAt(0)           : " + hex(ETIQUETA.charAt(0))
                + " · high surrogate: " + Character.isHighSurrogate(ETIQUETA.charAt(0)));
        System.out.println("charAt(1)           : " + hex(ETIQUETA.charAt(1))
                + " · low surrogate : " + Character.isLowSurrogate(ETIQUETA.charAt(1)));
        System.out.println("substring(0, 1)      : longitud " + ETIQUETA.substring(0, 1).length()
                + " · carácter suelto " + hex(ETIQUETA.substring(0, 1).charAt(0)) + " (par incompleto)");
        System.out.println("offsetByCodePoints(0, 1) : " + ETIQUETA.offsetByCodePoints(0, 1));

        System.out.println("--- recorrido por code points ---");
        int posicion = 0;
        int orden = 0;
        while (posicion < ETIQUETA.length()) {
            int cp = ETIQUETA.codePointAt(posicion);
            orden++;
            System.out.println("  " + hex(cp) + "  " + new String(Character.toChars(cp))
                    + " · letra " + Character.isLetter(cp)
                    + " · dígito " + Character.isDigit(cp)
                    + " · espacio " + Character.isSpaceChar(cp));
            posicion += Character.charCount(cp);
        }
        System.out.println("code points leídos  : " + orden);

        System.out.println("--- cortar una etiqueta a 8 caracteres ---");
        System.out.println("substring(0, 8)     : «" + ETIQUETA.substring(0, 8) + "» · "
                + ETIQUETA.substring(0, 8).chars().count() + " char, último "
                + hex(ETIQUETA.charAt(7)));
        System.out.println("prefijoSeguro(…, 8) : «" + prefijoSeguro(ETIQUETA, 8) + "»");

        System.out.println("--- el acento de Bogotá es un solo code point ---");
        String bogota = "Bogotá";
        System.out.println("length              : " + bogota.length() + " · code points "
                + bogota.codePointCount(0, bogota.length()));
        System.out.println("último code point   : " + hex(bogota.codePointAt(bogota.length() - 1))
                + " · isLetter " + Character.isLetter(bogota.codePointAt(bogota.length() - 1)));
        System.out.println("toUpperCase         : " + bogota.toUpperCase());
        System.out.println("mays. del emoji     : «" + ETIQUETA.substring(0, 2).toUpperCase() + "»");

        System.out.println("--- mayúsculas que cambian la longitud ---");
        String beta = "ß"; // eszett
        System.out.println("ß                   : length " + beta.length() + " → mayúsculas «"
                + beta.toUpperCase() + "» length " + beta.toUpperCase().length());
        String iTurca = "İ"; // I con punto
        System.out.println("I turca             : length " + iTurca.length() + " → minúsculas length "
                + iTurca.toLowerCase().length() + " · code points "
                + iTurca.toLowerCase().codePointCount(0, iTurca.toLowerCase().length()));
    }
}
