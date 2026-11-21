// tema-5/Formato.java — las conversiones de String.format, una por una, con salidas medidas.
// Ejecutar: javac --release 25 -d out tema-5/Formato.java && java -Dstdout.encoding=UTF-8 -cp out Formato
import java.util.Locale;

public class Formato {

    static final Locale ES = Locale.forLanguageTag("es-CO");
    static final Locale EN = Locale.forLanguageTag("en-US");

    static void muestra(String etiqueta, String plantilla, Object... args) {
        System.out.println(etiqueta + " : «" + String.format(plantilla, args) + "»");
    }

    public static void main(String[] args) {
        String guia = "RF-000123";
        int peso = 2500;
        double costo = 11400.0;

        System.out.println("--- texto y números ---");
        muestra("%s", "%s", guia);
        muestra("%d", "%d", peso);
        muestra("%5d (ancho 5, a la derecha)", "%5d", peso);
        muestra("%-5d| (ancho 5, a la izquierda)", "%-5d|", peso);
        muestra("%06d (relleno con ceros)", "%06d", peso);
        muestra("%.1f (un decimal)", "%.1f", costo);
        muestra("%+.1f (signo forzado)", "%+.1f", costo);
        muestra("%e (notación científica)", "%e", costo);
        muestra("%x (hexadecimal)", "%x", peso);
        muestra("%c (carácter)", "%c", 'A');
        muestra("%b (booleano)", "%b", true);
        muestra("%% (porcentaje literal)", "descuento del 15%%");

        System.out.println("--- separadores según el idioma ---");
        int grande = 1234567;
        System.out.println("Locale por defecto de la máquina : " + Locale.getDefault());
        System.out.println("%,d con Locale.US   : " + String.format(EN, "%,d", grande));
        System.out.println("%,d con es-CO       : " + String.format(ES, "%,d", grande));
        System.out.println("%.2f con Locale.US  : " + String.format(EN, "%.2f", 1234.567));
        System.out.println("%.2f con es-CO      : " + String.format(ES, "%.2f", 1234.567));
        System.out.println("%,.2f sin idioma    : " + String.format("%,.2f", 1234.567));

        System.out.println("--- reutilizar y reordenar argumentos ---");
        System.out.println("«%s y %<s»  con una guía   : " + String.format("%s y %<s", guia));
        System.out.println("«%2$s %1$s» con dos textos : " + String.format("%2$s %1$s", "Centro", guia));
        System.out.println("«%s → %s»   con dos textos : " + String.format("%s → %s", "Bogotá", "Medellín"));

        System.out.println("--- una etiqueta completa, dos formas de armarla ---");
        String conConcat = "Guía " + guia + ", destino Bogotá, peso " + peso + " g, costo $" + costo;
        String conFormat = String.format(EN, "Guía %s, destino %s, peso %d g, costo $%.2f",
                guia, "Bogotá", peso, costo);
        System.out.println("concat    : " + conConcat);
        System.out.println("format    : " + conFormat);
        System.out.println("mismo texto en la parte de los números: "
                + conFormat.substring(conFormat.indexOf("peso")));

        System.out.println("--- %n no es «\\n» ---");
        System.out.printf("primera línea%nsegunda línea%n");
        System.out.println("salto de línea del sistema : " + System.lineSeparator().equals("\n"));
    }
}
