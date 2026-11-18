import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Lee el JSON de verdad y comprueba nombre y tipo de cada campo del contrato de envío. */
public final class CompatibilidadContrato {
  private CompatibilidadContrato() { }

  public static void main(String[] args) throws Exception {
    for (String file : args) {
      String json = Files.readString(Path.of(file), StandardCharsets.UTF_8);
      Map<String, Object> envio = new LectorJson(json).leerObjetoRaiz();
      exigirTexto(envio, "id");
      exigirTexto(envio, "estado");
      Object ciudad = envio.get("ciudadDestino");
      if (ciudad != null && !(ciudad instanceof String))
        throw new IllegalArgumentException("CONTRATO_INCOMPATIBLE: ciudadDestino debe ser texto");
      System.out.println(Path.of(file).getFileName() + " ciudad=" + (ciudad == null ? "DESCONOCIDA" : "PRESENTE"));
    }
  }

  private static void exigirTexto(Map<String, Object> envio, String campo) {
    if (!envio.containsKey(campo)) throw new IllegalArgumentException("CONTRATO_INVALIDO: falta " + campo);
    if (!(envio.get(campo) instanceof String))
      throw new IllegalArgumentException("CONTRATO_INCOMPATIBLE: " + campo + " debe ser texto");
  }

  /** Lector JSON mínimo para el laboratorio; en un servicio real usa Jackson y un esquema. */
  private static final class LectorJson {
    private final String texto;
    private int pos;

    LectorJson(String texto) { this.texto = texto; }

    Map<String, Object> leerObjetoRaiz() {
      Object valor = leerValor();
      saltarEspacios();
      if (pos != texto.length() || !(valor instanceof Map<?, ?>))
        throw new IllegalArgumentException("CONTRATO_INVALIDO: se esperaba un único objeto JSON");
      @SuppressWarnings("unchecked") Map<String, Object> objeto = (Map<String, Object>) valor;
      return objeto;
    }

    private Object leerValor() {
      saltarEspacios();
      if (pos >= texto.length()) throw error("fin inesperado");
      char c = texto.charAt(pos);
      if (c == '{') return leerObjeto();
      if (c == '[') return leerLista();
      if (c == '"') return leerTexto();
      int inicio = pos;
      while (pos < texto.length() && ",}] \n\r\t".indexOf(texto.charAt(pos)) < 0) pos++;
      String literal = texto.substring(inicio, pos);
      if (literal.equals("true") || literal.equals("false")) return Boolean.valueOf(literal);
      if (literal.equals("null")) return null;
      try { return new java.math.BigDecimal(literal); }
      catch (NumberFormatException e) { throw error("valor no válido: " + literal); }
    }

    private Map<String, Object> leerObjeto() {
      var objeto = new LinkedHashMap<String, Object>();
      pos++;
      saltarEspacios();
      if (consumir('}')) return objeto;
      do {
        saltarEspacios();
        String clave = leerTexto();
        saltarEspacios();
        if (!consumir(':')) throw error("se esperaba ':'");
        objeto.put(clave, leerValor());
        saltarEspacios();
      } while (consumir(','));
      if (!consumir('}')) throw error("se esperaba '}'");
      return objeto;
    }

    private List<Object> leerLista() {
      var lista = new ArrayList<Object>();
      pos++;
      saltarEspacios();
      if (consumir(']')) return lista;
      do { lista.add(leerValor()); saltarEspacios(); } while (consumir(','));
      if (!consumir(']')) throw error("se esperaba ']'");
      return lista;
    }

    private String leerTexto() {
      if (!consumir('"')) throw error("se esperaba '\"'");
      var resultado = new StringBuilder();
      while (pos < texto.length() && texto.charAt(pos) != '"') {
        char c = texto.charAt(pos++);
        if (c == '\\' && pos < texto.length()) c = texto.charAt(pos++); // basta para el laboratorio
        resultado.append(c);
      }
      if (!consumir('"')) throw error("texto sin cerrar");
      return resultado.toString();
    }

    private boolean consumir(char esperado) {
      if (pos < texto.length() && texto.charAt(pos) == esperado) { pos++; return true; }
      return false;
    }

    private void saltarEspacios() {
      while (pos < texto.length() && Character.isWhitespace(texto.charAt(pos))) pos++;
    }

    private IllegalArgumentException error(String detalle) {
      return new IllegalArgumentException("JSON_INVALIDO en posición " + pos + ": " + detalle);
    }
  }
}
