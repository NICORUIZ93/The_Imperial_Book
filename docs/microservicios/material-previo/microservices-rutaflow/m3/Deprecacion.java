import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * M3 T5 · Cabeceras de deprecación (RFC 9745) y retiro (RFC 8594) para una versión de la API.
 * Uso: java Deprecacion.java                 (fechas coherentes)
 *      java Deprecacion.java --rfc1123       (fallo deliberado: formateador de Java sin día de dos dígitos)
 *      java Deprecacion.java --sunset-antes  (fallo deliberado: retiro anterior a la deprecación)
 */
public final class Deprecacion {
  record Aviso(Instant deprecacion, Instant retiro, String documentacion) {
    Aviso {
      // RFC 9745: el retiro (Sunset) no debe ser anterior a la deprecación.
      if (retiro.isBefore(deprecacion))
        throw new IllegalArgumentException("Sunset " + retiro + " es anterior a Deprecation " + deprecacion);
    }

    String deprecation() { return "@" + deprecacion.getEpochSecond(); }

    // RFC 9110 exige IMF-fixdate al generar fechas HTTP: día con dos dígitos y «GMT».
    String sunset() {
      return (usarRfc1123 ? DateTimeFormatter.RFC_1123_DATE_TIME : IMF_FIXDATE).format(retiro.atOffset(ZoneOffset.UTC));
    }

    String link() { return "<" + documentacion + ">; rel=\"deprecation\"; type=\"text/html\""; }
  }

  private static final DateTimeFormatter IMF_FIXDATE =
      DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Locale.ENGLISH);
  static boolean usarRfc1123 = false;

  static final Aviso CONSOLA_V1 = new Aviso(Instant.parse("2026-12-01T00:00:00Z"),
      Instant.parse("2027-03-01T00:00:00Z"), "https://rutaflow.example/docs/consola/v2");

  private Deprecacion() { }

  public static void main(String[] args) {
    usarRfc1123 = List.of(args).contains("--rfc1123");
    Aviso aviso = List.of(args).contains("--sunset-antes")
        ? new Aviso(Instant.parse("2026-12-01T00:00:00Z"), Instant.parse("2026-11-01T00:00:00Z"), "/docs")
        : CONSOLA_V1;
    System.out.println("Deprecation: " + aviso.deprecation());
    System.out.println("Sunset: " + aviso.sunset());
    System.out.println("Link: " + aviso.link());
  }
}
