// tema-2/SaltosLinea.java — «lines()» y «split("\\R")» frente a «split("\\n")» con terminadores raros.
// Los caracteres raros se escriben con Character.toString(código) para que el fuente sea legible.
// Ejecutar: javac --release 25 -d out tema-2/SaltosLinea.java
//           java -Dstdout.encoding=UTF-8 -cp out SaltosLinea
public class SaltosLinea {

    static String hex(int cp) {
        String h = Integer.toHexString(cp).toUpperCase();
        return "0".repeat(Math.max(0, 4 - h.length())) + h;
    }

    static void piezas(String nombre, String[] partes) {
        StringBuilder b = new StringBuilder("  " + nombre + " :");
        for (String p : partes) {
            b.append("  [").append(p.length()).append(", final ")
             .append(p.isEmpty() ? "—" : "U+" + hex(p.charAt(p.length() - 1))).append(']');
        }
        System.out.println(b + "  · " + partes.length + " piezas");
    }

    static void prueba(String nombre, String texto) {
        System.out.println("--- " + nombre + " · texto de " + texto.length() + " char · último U+"
                + hex(texto.charAt(texto.length() - 1)));
        System.out.println("  lines().count() : " + texto.lines().count());
        piezas("split(\\R)", texto.split("\\R"));
        piezas("split(\\n)", texto.split("\n"));
        System.out.println();
    }

    public static void main(String[] args) {
        String guia = "RF-0001";                    // 7 caracteres, para ver los códigos sueltos
        String ciudad = "Bogot";                    // sin la á: el texto se arma aquí abajo
        String a = guia + Character.toString(0x000A) + ciudad + Character.toString(0x00E1);
        String b = guia + Character.toString(0x000D) + Character.toString(0x000A) + ciudad + Character.toString(0x00E1);
        String c = guia + Character.toString(0x000D) + ciudad + Character.toString(0x00E1);
        String d = guia + Character.toString(0x0085) + ciudad + Character.toString(0x00E1);
        String e = guia + Character.toString(0x2028) + ciudad + Character.toString(0x00E1);
        String f = guia + Character.toString(0x000B) + ciudad + Character.toString(0x000C) + "Cali";

        prueba("LF     ", a);
        prueba("CRLF   ", b);
        prueba("CR solo", c);
        prueba("NEL    ", d);
        prueba("U+2028 ", e);
        prueba("VT y FF", f);
    }
}
