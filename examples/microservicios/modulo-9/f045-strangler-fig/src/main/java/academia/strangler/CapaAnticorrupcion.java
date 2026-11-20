package academia.strangler;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Capa anticorrupción (ACL): traduce el registro heredado del monolito
 * "COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S" al modelo del servicio nuevo.
 * Ninguna clase del servicio nuevo conoce los nombres ni los formatos del monolito.
 */
public final class CapaAnticorrupcion {

    public enum Zona { URBANA, METROPOLITANA, REGIONAL }

    public record Tarifa(Zona zona, BigDecimal precioPorKg, long basePesos) {
    }

    public static final class RegistroHeredadoInvalido extends RuntimeException {
        RegistroHeredadoInvalido(String mensaje) {
            super(mensaje);
        }
    }

    // Única tabla de equivalencias: si el monolito inventa una zona nueva, falla aquí y no en el dominio.
    private static final Map<String, Zona> ZONAS = Map.of("Z01", Zona.URBANA, "Z03", Zona.METROPOLITANA,
            "Z07", Zona.REGIONAL);

    private CapaAnticorrupcion() {
    }

    public static Tarifa traducir(String registro) {
        Map<String, String> campos = new HashMap<>();
        for (String par : registro.strip().split("\\|")) {
            String[] kv = par.split("=", 2);
            if (kv.length == 2) {
                campos.put(kv[0], kv[1]);
            }
        }
        for (String obligatorio : List.of("COD_ZONA", "TARIFA_X_KG", "BASE", "IND_ACTIVO")) {
            if (!campos.containsKey(obligatorio)) {
                throw new RegistroHeredadoInvalido("falta " + obligatorio + " en '" + registro + "'");
            }
        }
        if (!"S".equals(campos.get("IND_ACTIVO"))) {
            throw new RegistroHeredadoInvalido("tarifa inactiva para " + campos.get("COD_ZONA"));
        }
        Zona zona = ZONAS.get(campos.get("COD_ZONA"));
        if (zona == null) {
            throw new RegistroHeredadoInvalido("zona heredada desconocida: " + campos.get("COD_ZONA"));
        }
        // El monolito escribe decimales con coma (1250,50). Se convierte UNA vez, aquí, con BigDecimal.
        BigDecimal precio = new BigDecimal(campos.get("TARIFA_X_KG").replace(',', '.'));
        return new Tarifa(zona, precio, Long.parseLong(campos.get("BASE")));
    }

    public static void main(String[] args) {
        for (String registro : List.of(
                "COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S",
                "COD_ZONA=Z09|TARIFA_X_KG=3000,00|BASE=9000|IND_ACTIVO=S",
                "COD_ZONA=Z07|TARIFA_X_KG=2100,75|BASE=9000|IND_ACTIVO=N")) {
            try {
                System.out.println("OK      " + traducir(registro));
            } catch (RegistroHeredadoInvalido e) {
                System.out.println("RECHAZO " + e.getMessage());
            }
        }
    }
}
