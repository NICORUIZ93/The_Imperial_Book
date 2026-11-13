import java.util.LinkedHashMap;

public final class FalaciasDistribuidas {
  private FalaciasDistribuidas() { }
  public static void main(String[] args) {
    var evidence = new LinkedHashMap<String, String>();
    evidence.put("red_confiable", "timeout+reconciliacion");
    evidence.put("latencia_cero", "deadline+medicion");
    evidence.put("ancho_infinito", "limite+framing");
    evidence.put("red_segura", "autenticacion+cifrado+autorizacion");
    evidence.put("topologia_estable", "descubrimiento+health");
    evidence.put("sistema_homogeneo", "contrato+compatibilidad");
    evidence.forEach((assumption, mitigation) ->
        System.out.println("REFUTADA " + assumption + " -> " + mitigation));
  }
}
