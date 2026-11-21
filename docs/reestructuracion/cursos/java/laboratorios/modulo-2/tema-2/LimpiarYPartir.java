// tema-2/LimpiarYPartir.java — strip frente a trim, indent, isBlank y lo que split hace con los huecos del final.
// El espacio sin ruptura de línea se escribe con Character.toString(0x00A0) para que el fuente sea legible.
// Ejecutar: javac --release 25 -d out tema-2/LimpiarYPartir.java
//           java -Dstdout.encoding=UTF-8 -cp out LimpiarYPartir
public class LimpiarYPartir {

    static final String NBSP = Character.toString(0x00A0);

    static void lista(String nombre, String s) {
        StringBuilder b = new StringBuilder(nombre + " : «" + s + "» · longitud " + s.length() + " ·");
        s.codePoints().forEach(cp -> b.append(' ').append("U+").append(Integer.toHexString(cp).toUpperCase()));
        System.out.println(b);
    }

    public static void main(String[] args) {
        System.out.println("--- limpiar: trim corta hasta U+0020, strip corta espacio Unicode ---");
        for (String muestra : new String[] {"  Bogotá  ", "\tBogotá\n",
                Character.toString(0x2028) + "Bogotá", NBSP + "Bogotá" + NBSP,
                Character.toString(0x200B) + "Bogotá"}) {
            lista("original    ", muestra);
            lista("trim()      ", muestra.trim());
            lista("strip()     ", muestra.strip());
            System.out.println();
        }
        System.out.println("isWhitespace(U+00A0)        : " + Character.isWhitespace(0x00A0)
                + " · isWhitespace(U+2028): " + Character.isWhitespace(0x2028));

        System.out.println("--- isBlank: huecos y saltos cuentan como nada ---");
        for (String s : new String[] {"", "   ", "\t\n", NBSP, " " + NBSP + " RF-000123 "}) {
            System.out.println("  «" + s + "» · length " + s.length() + " · isBlank " + s.isBlank()
                    + " · isEmpty " + s.isEmpty());
        }

        System.out.println("--- indent añade y cierra con salto de línea (menos si está vacío) ---");
        lista("sin indent  ", "Bogotá");
        lista("indent(2)   ", "Bogotá".indent(2));
        lista("indent(-1)  ", "  Bogotá".indent(-1));
        lista("vacío+indent", "".indent(2));

        System.out.println("--- split: las piezas vacías del final desaparecen ---");
        String[] sinLimite = "RF-000123;Bogotá;".split(";");
        String[] conLimite = "RF-000123;Bogotá;".split(";", -1);
        System.out.println("split(\";\")    : " + sinLimite.length + " campos · última «" + sinLimite[sinLimite.length - 1] + "»");
        System.out.println("split(\";\", -1): " + conLimite.length + " campos · última «" + conLimite[conLimite.length - 1] + "»");
        String[] conPunto = "RF-000.123".split(".");
        System.out.println("split(\".\")    : " + conPunto.length + " campos (el punto en regex vale «cualquier carácter»)");
        System.out.println("\"a,,b,\"        : sin límite " + "a,,b,".split(",").length
                + " piezas · con -1 " + "a,,b,".split(",", -1).length + " piezas");
        System.out.println("\",a,,b,\"     : sin límite " + ",a,,b,".split(",").length
                + " piezas · con -1 " + ",a,,b,".split(",", -1).length + " piezas");

        System.out.println("--- unir: join no deja separador colgando ---");
        System.out.println("join            : " + String.join(" · ", "RF-000123", "Bogotá", "2500 g"));
        System.out.println("repeat          : " + "|".repeat(5));
        System.out.println("repeat(-1)      : se ve en el laboratorio (lanza IllegalArgumentException)");
    }
}
