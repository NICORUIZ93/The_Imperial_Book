// tema-2/PlantillaEtiqueta.java — bloques de texto: sangría, \s, translateEscapes y formatted.
// Ejecutar: javac --release 25 -d out PlantillaEtiqueta.java && java -cp out PlantillaEtiqueta
public class PlantillaEtiqueta {

    /** Sin stripIndent: conserva la sangría común del bloque como parte del valor. */
    static final String CON_SANGRIA = """
            RUTAFLOW · etiqueta de envío
              guía   : %s
              destino: %s
              peso   : %d g
            """;

    /** Con stripIndent: la sangría común se quita, la relativa se queda. */
    static final String SIN_SANGRIA = """
            RUTAFLOW · etiqueta de envío
              guía   : %s
              destino: %s
              peso   : %d g
            """.stripIndent();

    public static void main(String[] args) {
        System.out.println("--- con sangría conservada, formateada ---");
        System.out.print(CON_SANGRIA.formatted("RF-000123", "Bogotá", 2500));

        System.out.println("--- con stripIndent ---");
        System.out.print(SIN_SANGRIA.formatted("RF-000456", "Medellín", 1800));

        // `\` al final de una línea la une con la siguiente; `\s` solo protege el espacio final.
        String unidas = """
            guía RF-\
            000123
            peso   2500\sg"""
            ;
        System.out.println("--- \\ une líneas, \\s protege el espacio final ---");
        System.out.println(unidas);
        System.out.println("líneas: " + unidas.lines().count());

        String literales = """
            primera\\nsegunda
            segunda\\tcolumna""";
        System.out.println("--- escapes sin traducir (son texto literal) ---");
        System.out.println(literales);
        System.out.println("--- translateEscapes: ahora sí son escapes ---");
        System.out.println(literales.translateEscapes());
    }
}
