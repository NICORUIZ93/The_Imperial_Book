// tema-4/Charsets.java — caracteres, unidades UTF-16 y bytes: tres cuentas distintas de la misma etiqueta.
// Ejecutar: javac --release 25 -d out tema-4/Charsets.java && java -Dstdout.encoding=UTF-8 -cp out Charsets
//          java -Dstdout.encoding=UTF-8 -Dfile.encoding=ISO-8859-1 -cp out Charsets   (para ver qué cambia)
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

public class Charsets {

    static final String CON_ACENTO = "Medellín";
    static final String CON_EMOJI = "📦";

    static final HexFormat HEX = HexFormat.of().withDelimiter(" ");

    static String hex(int cp) {
        String h = Integer.toHexString(cp).toUpperCase();
        return "0".repeat(Math.max(0, 4 - h.length())) + h;
    }

    static void bytes(String nombre, String s, Charset c) {
        byte[] b = s.getBytes(c);
        System.out.println("  " + nombre + " : " + b.length + " bytes · " + HEX.formatHex(b));
    }

    public static void main(String[] args) {
        System.out.println("--- qué charset es «el de la máquina» ---");
        System.out.println("Charset.defaultCharset() : " + Charset.defaultCharset());
        System.out.println("file.encoding            : " + System.getProperty("file.encoding"));
        System.out.println("native.encoding          : " + System.getProperty("native.encoding"));
        System.out.println("stdout.encoding          : " + System.getProperty("stdout.encoding"));
        System.out.println("sun.jnu.encoding         : " + System.getProperty("sun.jnu.encoding"));

        System.out.println("--- la misma etiqueta, tres medidas ---");
        System.out.println("texto                    : " + CON_ACENTO);
        System.out.println("length()                 : " + CON_ACENTO.length() + " unidades UTF-16");
        System.out.println("codePointCount           : " + CON_ACENTO.codePointCount(0, CON_ACENTO.length()));
        bytes("UTF-8     ", CON_ACENTO, StandardCharsets.UTF_8);
        bytes("UTF-16BE  ", CON_ACENTO, StandardCharsets.UTF_16BE);
        bytes("ISO-8859-1", CON_ACENTO, StandardCharsets.ISO_8859_1);

        System.out.println("--- un emoji ya no cabe en 8 bits ---");
        System.out.println("texto                    : " + CON_EMOJI);
        System.out.println("length()                 : " + CON_EMOJI.length() + " (un par sustituto)");
        bytes("UTF-8     ", CON_EMOJI, StandardCharsets.UTF_8);
        bytes("UTF-16BE  ", CON_EMOJI, StandardCharsets.UTF_16BE);
        CharsetEncoder latin1 = StandardCharsets.ISO_8859_1.newEncoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT);
        try {
            latin1.encode(CharBuffer.wrap(CON_EMOJI));
            System.out.println("ISO-8859-1  : codificó sin quejas (no era de esperar)");
        } catch (CharacterCodingException e) {
            System.out.println("ISO-8859-1  : " + e.getClass().getSimpleName() + " — el emoji no existe en Latin-1");
        }
        System.out.println("ISO-8859-1 sin REPORT   : " + HEX.formatHex(StandardCharsets.ISO_8859_1
                .encode(CON_EMOJI).array()) + " · es decir, «?» (se pierde el dato sin avisar)");

        System.out.println("--- leer con el charset equivocado: mojibake ---");
        byte[] enUtf8 = CON_ACENTO.getBytes(StandardCharsets.UTF_8);
        String mal = new String(enUtf8, StandardCharsets.ISO_8859_1);
        System.out.println("bytes UTF-8 leídos como ISO-8859-1 : «" + mal + "» · length " + mal.length());
        StringBuilder lista = new StringBuilder("  code points:");
        mal.codePoints().forEach(cp -> lista.append(" U+").append(hex(cp)));
        System.out.println(lista);
        System.out.println("son " + mal.length() + " caracteres distintos de los " + CON_ACENTO.length()
                + " originales");
        System.out.println("bytes UTF-8 leídos como UTF-8      : «"
                + new String(enUtf8, StandardCharsets.UTF_8) + "» · equals con el original: "
                + new String(enUtf8, StandardCharsets.UTF_8).equals(CON_ACENTO));

        System.out.println("--- el ancho en pantalla no lo da length() ---");
        for (String s : new String[] {"RF-000123", "Bogotá", CON_EMOJI, "📦 Bogotá"}) {
            System.out.println("  «" + s + "» → " + s.length() + " unidades UTF-16, "
                    + s.codePointCount(0, s.length()) + " code points, "
                    + s.getBytes(StandardCharsets.UTF_8).length + " bytes UTF-8");
        }
    }
}
