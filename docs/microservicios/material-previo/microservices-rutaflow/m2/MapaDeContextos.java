import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * M2 T1 · Mapa de contextos de RutaFlow.
 * Uso: java MapaDeContextos.java            (mapa sano)
 *      java MapaDeContextos.java --fuga     (añade una tabla compartida y la detecta)
 *      java MapaDeContextos.java --invariante (intenta emitir una cotización inválida)
 */
public final class MapaDeContextos {

  // El mismo sustantivo «envío» con dos modelos distintos, cada uno dentro de su contexto.
  record EnvioOperaciones(String envioId, String estado, String conductorId) { }
  record SolicitudCotizacion(String zona, BigDecimal pesoKg) { }

  enum Tipo { ACL, LENGUAJE_PUBLICADO, CLIENTE_PROVEEDOR, TABLA_COMPARTIDA }
  record Relacion(String aguasAbajo, String aguasArriba, Tipo tipo, String contrato) { }

  /** Agregado de Cotización: protege sus invariantes y registra un evento de dominio. */
  static final class Cotizacion {
    private final String id;
    private final long totalCop;
    private final LocalDate vigenteHasta;
    private final List<String> eventos = new ArrayList<>();

    private Cotizacion(String id, long totalCop, LocalDate vigenteHasta) {
      this.id = id;
      this.totalCop = totalCop;
      this.vigenteHasta = vigenteHasta;
    }

    static Cotizacion emitir(String id, long totalCop, LocalDate hoy, int diasVigencia) {
      if (totalCop <= 0) throw new IllegalArgumentException("total debe ser positivo: " + totalCop);
      if (diasVigencia < 1 || diasVigencia > 15)
        throw new IllegalArgumentException("vigencia fuera de 1..15 días: " + diasVigencia);
      var cotizacion = new Cotizacion(id, totalCop, hoy.plusDays(diasVigencia));
      cotizacion.eventos.add("CotizacionEmitida(" + id + ", " + totalCop + " COP, hasta "
          + cotizacion.vigenteHasta + ")");
      return cotizacion;
    }

    List<String> eventos() { return List.copyOf(eventos); }
  }

  static List<String> violaciones(List<Relacion> mapa) {
    List<String> encontradas = new ArrayList<>();
    for (Relacion r : mapa) {
      if (r.tipo() == Tipo.TABLA_COMPARTIDA) {
        encontradas.add(r.aguasAbajo() + " lee " + r.contrato() + " de " + r.aguasArriba()
            + ": cambia junto con su esquema");
      }
    }
    return encontradas;
  }

  public static void main(String[] args) {
    boolean conFuga = List.of(args).contains("--fuga");
    boolean invalida = List.of(args).contains("--invariante");

    var enOperaciones = new EnvioOperaciones("E-100", "EN_TRANSITO", "C-7");
    var enCotizacion = new SolicitudCotizacion("Z03", new BigDecimal("2.5"));
    System.out.println("Operaciones ve: " + enOperaciones);
    System.out.println("Cotizacion ve:  " + enCotizacion);

    List<Relacion> mapa = new ArrayList<>(List.of(
        new Relacion("Cotizacion", "Monolito", Tipo.ACL, "GET /legacy/tarifas/{zona}"),
        new Relacion("Facturacion", "Cotizacion", Tipo.LENGUAJE_PUBLICADO, "CotizacionEmitida v1"),
        new Relacion("Operaciones", "Monolito", Tipo.CLIENTE_PROVEEDOR, "GET /envios/{id}")));
    if (conFuga) mapa.add(new Relacion("Cotizacion", "Monolito", Tipo.TABLA_COMPARTIDA, "tabla TARIFAS_ZONA"));

    mapa.forEach(r -> System.out.println("MAPA " + r.aguasAbajo() + " -> " + r.aguasArriba()
        + " [" + r.tipo() + "] " + r.contrato()));
    List<String> problemas = violaciones(mapa);
    problemas.forEach(p -> System.out.println("VIOLACION " + p));
    System.out.println(problemas.isEmpty() ? "MAPA_OK" : "MAPA_CON_FUGAS=" + problemas.size());

    var hoy = LocalDate.of(2026, 11, 18);
    var cotizacion = Cotizacion.emitir("Q-1", invalida ? 0 : 8126, hoy, 7);
    cotizacion.eventos().forEach(e -> System.out.println("EVENTO " + e));
  }
}
