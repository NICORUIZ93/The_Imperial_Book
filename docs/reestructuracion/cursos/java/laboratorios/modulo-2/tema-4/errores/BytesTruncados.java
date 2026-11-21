// tema-4/errores/BytesTruncados.java — cortar por bytes un texto UTF-8 parte caracteres por la mitad.
// Es el fallo que da la etiqueta ilegible cuando el límite del sistema de impresión son 12 bytes.
// Ejecutar: javac --release 25 -d out tema-4/errores/BytesTruncados.java
//           java -Dstdout.encoding=UTF-8 -cp out BytesTruncados
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HexFormat;

public class BytesTruncados {

    static final HexFormat HEX = HexFormat.of().withDelimiter(" ");
    static final String ETIQUETA = "Bogotá Centro 📦";

    static String hex(int cp) {
        String h = Integer.toHexString(cp).toUpperCase();
        return "0".repeat(Math.max(0, 4 - h.length())) + h;
    }

    /** Acumula code points mientras su UTF-8 quepa en el presupuesto: nunca parte un carácter. */
    static String encajaEnBytes(String s, int presupuesto) {
        StringBuilder b = new StringBuilder();
        int usados = 0;
        int p = 0;
        while (p < s.length()) {
            int cp = s.codePointAt(p);
            int ancho = new String(Character.toChars(cp)).getBytes(StandardCharsets.UTF_8).length;
            if (usados + ancho > presupuesto) {
                break;
            }
            b.appendCodePoint(cp);
            usados += ancho;
            p += Character.charCount(cp);
        }
        return b.toString();
    }

    public static void main(String[] args) {
        byte[] todos = ETIQUETA.getBytes(StandardCharsets.UTF_8);
        System.out.println("original            : «" + ETIQUETA + "» · " + ETIQUETA.length()
                + " char · " + ETIQUETA.codePointCount(0, ETIQUETA.length()) + " code points · "
                + todos.length + " bytes UTF-8");

        byte[] cortados = Arrays.copyOf(todos, 6);
        System.out.println("corte a 6 bytes     : " + HEX.formatHex(cortados));
        System.out.println("                    : «" + new String(cortados, StandardCharsets.UTF_8) + "» · el último byte "
                + HEX.formatHex(new byte[] {cortados[5]}) + " es la primera mitad de la á");

        byte[] doce = Arrays.copyOf(todos, 12);
        System.out.println("corte a 12 bytes    : «" + new String(doce, StandardCharsets.UTF_8)
                + "» · este corte sí cae entre caracteres");

        String segura = encajaEnBytes(ETIQUETA, 12);
        System.out.println("encajaEnBytes(…, 12): «" + segura + "» · "
                + segura.getBytes(StandardCharsets.UTF_8).length + " bytes · sin caracteres rotos");

        // Y el mismo fenómeno en una secuencia suelta: 0xC3 sin su segundo byte.
        byte[] roto = {0x42, 0x6F, 0x67, 0x6F, (byte) 0xC3}; // «Bogo» + el primer byte de la á
        String decodificado = new String(roto, StandardCharsets.UTF_8);
        System.out.print("secuencia incompleta: «" + decodificado + "» → code points");
        decodificado.codePoints().forEach(cp -> System.out.print(" U+" + hex(cp)));
        System.out.println();
        System.out.println("decodificación estricta:");
        try {
            StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(java.nio.charset.CodingErrorAction.REPORT)
                    .decode(java.nio.ByteBuffer.wrap(roto));
            System.out.println("  decodificó (no era de esperar)");
        } catch (java.nio.charset.CharacterCodingException e) {
            System.out.println("  " + e.getClass().getSimpleName() + " — así se detecta antes de imprimir mal la etiqueta");
        }
    }
}
