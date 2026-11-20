import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * M4 T1 · Evento de dominio frente a evento de integración, y mensaje frente a llamada.
 * Uso: java EventosRutaflow.java                     (traduce el evento de dominio a uno de integración)
 *      java EventosRutaflow.java --publicar-dominio  (fallo deliberado: publica el evento interno tal cual)
 */
public final class EventosRutaflow {

  /** Evento de dominio: hecho interno, rico en datos, solo lo ven los componentes del contexto Envíos. */
  record EnvioCreado(String envioId, String clienteId, BigDecimal pesoKg, String zona,
                     String direccionCompleta, String telefonoReceptor, Instant ocurridoEn) { }

  /** Agregado Envío: protege sus invariantes y registra el hecho en el mismo cambio de estado. */
  static final class Envio {
    private final String id;
    private final List<EnvioCreado> eventos = new ArrayList<>();

    private Envio(String id) { this.id = id; }

    static Envio crear(String id, String clienteId, BigDecimal pesoKg, String zona, String direccion,
                       String telefono, Instant ahora) {
      if (pesoKg.signum() <= 0) throw new IllegalArgumentException("peso debe ser positivo: " + pesoKg);
      var envio = new Envio(id);
      envio.eventos.add(new EnvioCreado(id, clienteId, pesoKg, zona, direccion, telefono, ahora));
      return envio;
    }

    List<EnvioCreado> eventosPendientes() { return List.copyOf(eventos); }
  }

  /** Evento de integración: contrato público, versionado y con solo lo que otros contextos necesitan. */
  static Map<String, Object> aIntegracion(EnvioCreado e, UUID eventoId) {
    Map<String, Object> mensaje = new LinkedHashMap<>();
    mensaje.put("eventoId", eventoId);
    mensaje.put("tipo", "EnvioCreado");
    mensaje.put("version", 1);
    mensaje.put("envioId", e.envioId());
    mensaje.put("clienteId", e.clienteId());
    mensaje.put("zona", e.zona());
    mensaje.put("pesoKg", e.pesoKg());
    mensaje.put("ocurridoEn", e.ocurridoEn());
    return mensaje;
  }

  static List<String> camposSensibles(String mensaje) {
    return List.of("telefonoReceptor", "direccionCompleta").stream().filter(mensaje::contains).toList();
  }

  enum Estilo { LLAMADA, MENSAJE }

  /** Llamada si quien pide necesita la respuesta para continuar; mensaje si solo informa un hecho. */
  static Estilo estilo(boolean necesitaRespuestaParaContinuar) {
    return necesitaRespuestaParaContinuar ? Estilo.LLAMADA : Estilo.MENSAJE;
  }

  public static void main(String[] args) {
    boolean publicarDominio = List.of(args).contains("--publicar-dominio");
    var envio = Envio.crear("E-100", "CL-9", new BigDecimal("2.5"), "Z03", "Cra 7 # 72-10 apto 301",
        "+57 300 000 0000", Instant.parse("2026-11-18T15:00:00Z"));
    EnvioCreado evento = envio.eventosPendientes().get(0);
    System.out.println("DOMINIO " + evento);

    String publicado = publicarDominio ? evento.toString()
        : aIntegracion(evento, UUID.fromString("00000000-0000-0000-0000-000000000001")).toString();
    System.out.println("PUBLICADO " + publicado);
    List<String> fugas = camposSensibles(publicado);
    System.out.println(fugas.isEmpty() ? "SIN_FUGAS" : "FUGA " + fugas);

    System.out.println("Cotizar antes de crear el envio -> " + estilo(true));
    System.out.println("Avisar a Facturacion que se creo -> " + estilo(false));
    System.out.println("Notificar al cliente por correo   -> " + estilo(false));
  }
}
