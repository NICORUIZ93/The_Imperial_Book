import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class MedirCohesion {
  record Cambio(String motivo, String claseAfectada) { }
  private MedirCohesion() { }

  static Map<String, List<String>> agruparPorMotivo(List<Cambio> cambios) {
    return cambios.stream().collect(Collectors.groupingBy(
        Cambio::motivo,
        Collectors.mapping(Cambio::claseAfectada, Collectors.toList())));
  }

  public static void main(String[] args) {
    var cambios = List.of(
        new Cambio("regla-envio", "CalcularTarifa"),
        new Cambio("regla-envio", "AsignarConductor"),
        new Cambio("regla-factura", "CalcularImpuesto"));
    agruparPorMotivo(cambios).forEach((motivo, clases) ->
        System.out.println(motivo + "=" + clases.size()));
  }
}
