import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * M2 T4 · Capa anticorrupción entre Cotización y el monolito.
 * Traduce el registro heredado «COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S»
 * al modelo nuevo. Ninguna clase del dominio nuevo conoce los nombres heredados.
 *
 * Uso: java CapaAnticorrupcion.java            (traduce cuatro registros de ejemplo)
 *      java CapaAnticorrupcion.java --double   (fallo deliberado: decimal con Double.parseDouble)
 */
public final class CapaAnticorrupcion {

  enum Zona { URBANA, METROPOLITANA, REGIONAL }

  record Tarifa(Zona zona, BigDecimal precioPorKgCop, long baseCop) { }

  static final class RegistroHeredadoInvalido extends RuntimeException {
    RegistroHeredadoInvalido(String mensaje) { super(mensaje); }
  }

  // Única tabla de equivalencias: si el monolito agrega una zona, falla aquí y no en el dominio.
  private static final Map<String, Zona> ZONAS = Map.of("Z01", Zona.URBANA, "Z03", Zona.METROPOLITANA,
      "Z07", Zona.REGIONAL);

  static boolean usarDouble = false;

  private CapaAnticorrupcion() { }

  static Zona zona(String codigoHeredado) {
    Zona zona = ZONAS.get(codigoHeredado);
    if (zona == null) throw new RegistroHeredadoInvalido("zona heredada desconocida: " + codigoHeredado);
    return zona;
  }

  static String codigoHeredado(Zona zona) {
    return ZONAS.entrySet().stream().filter(e -> e.getValue() == zona).findFirst().orElseThrow().getKey();
  }

  static Tarifa traducir(String registro) {
    Map<String, String> campos = new HashMap<>();
    for (String par : registro.trim().split("\\|")) {
      String[] kv = par.split("=", 2);
      if (kv.length == 2) campos.put(kv[0], kv[1]);
    }
    for (String obligatorio : List.of("COD_ZONA", "TARIFA_X_KG", "BASE", "IND_ACTIVO")) {
      if (!campos.containsKey(obligatorio))
        throw new RegistroHeredadoInvalido("falta " + obligatorio + " en '" + registro + "'");
    }
    if (!"S".equals(campos.get("IND_ACTIVO")))
      throw new RegistroHeredadoInvalido("tarifa inactiva para " + campos.get("COD_ZONA"));
    return new Tarifa(zona(campos.get("COD_ZONA")), precio(campos.get("TARIFA_X_KG")),
        Long.parseLong(campos.get("BASE")));
  }

  // El monolito escribe decimales con coma (1250,50). Se convierte una vez, en la frontera.
  private static BigDecimal precio(String textoHeredado) {
    if (usarDouble) return BigDecimal.valueOf(Double.parseDouble(textoHeredado));
    return new BigDecimal(textoHeredado.replace(',', '.'));
  }

  public static void main(String[] args) {
    usarDouble = List.of(args).contains("--double");
    List<String> registros = List.of(
        "COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S",
        "COD_ZONA=Z01|TARIFA_X_KG=980,00|BASE=4000|IND_ACTIVO=S",
        "COD_ZONA=Z09|TARIFA_X_KG=3000,00|BASE=9000|IND_ACTIVO=S",
        "COD_ZONA=Z07|TARIFA_X_KG=2100,75|BASE=9000|IND_ACTIVO=N");
    for (String registro : registros) {
      try {
        System.out.println("OK      " + traducir(registro));
      } catch (RegistroHeredadoInvalido error) {
        System.out.println("RECHAZO " + error.getMessage());
      }
    }
  }
}
