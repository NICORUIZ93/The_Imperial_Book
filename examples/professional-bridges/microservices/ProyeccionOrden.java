import java.util.HashMap;
import java.util.List;

public final class ProyeccionOrden {
  record Evento(String id, long version) { }

  private ProyeccionOrden() { }

  public static void main(String[] args) {
    var ultima = new HashMap<String, Long>();
    var eventos = List.of(
        new Evento("ENV-1", 1),
        new Evento("ENV-1", 3),
        new Evento("ENV-1", 2),
        new Evento("ENV-1", 2),
        new Evento("ENV-2", 1));
    for (var evento : eventos) {
      long actual = ultima.getOrDefault(evento.id(), 0L);
      String resultado;
      if (evento.version() == actual + 1) {
        ultima.put(evento.id(), evento.version());
        resultado = "APLICADO";
      } else if (evento.version() <= actual) {
        resultado = "OBSOLETO_O_DUPLICADO";
      } else {
        resultado = "HUECO_ESPERABA_v" + (actual + 1);
      }
      System.out.printf("%s %s:v%d%n", resultado, evento.id(), evento.version());
    }
  }
}
