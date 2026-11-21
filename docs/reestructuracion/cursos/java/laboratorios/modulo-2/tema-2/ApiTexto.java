// tema-2/ApiTexto.java — la API moderna de String, sobre el manifiesto de recolección.
// Ejecutar: javac --release 25 -d out ApiTexto.java && java -cp out ApiTexto
import java.util.List;

public class ApiTexto {

    // El manifiesto llega con espacios sueltos, líneas vacías y columnas desalineadas.
    static final String MANIFIESTO = """
              RF-000123 , Bogotá  , 2500\s
            RF-000456,Medellín,1800
      \s
             RF-000789 , Cali    , 4200\s
            """;

    public static void main(String[] args) {
        List<String> lineas = MANIFIESTO.lines().filter(s -> !s.isBlank()).toList();
        System.out.println("leídas totales   : " + MANIFIESTO.lines().count());
        System.out.println("sin líneas basura: " + lineas.size());

        for (String linea : lineas) {
            String[] columna = linea.strip().split("\\s*,\\s*");
            String guia = columna[0];
            String destino = columna[1];
            int gramos = Integer.parseInt(columna[2]);
            System.out.println("  " + guia.strip() + " → " + destino.strip() + " · " + gramos + " g");
        }

        String unaGuia = "RF-000123";
        System.out.println("repeat           : " + "─".repeat(12 + unaGuia.length()));
        System.out.println("formatted        : " + "%s · %s · %d g".formatted(unaGuia, "Bogotá", 2500));
        System.out.println("startsWith       : " + unaGuia.startsWith("RF-"));
        System.out.println("replace(' ', '+'): " + "Bogotá Centro".replace(' ', '+'));
        System.out.println("charAt(2)        : " + unaGuia.charAt(2));
        System.out.println("indexOf('1')     : " + unaGuia.indexOf('1'));
        System.out.println("concat vs +      : " + unaGuia.concat("-OK"));
    }
}
