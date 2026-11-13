import java.util.*;
public final class DetectarCiclo {
  static boolean visitar(String n, Map<String,List<String>> g, Set<String> activos, Set<String> vistos) {
    if (activos.contains(n)) return true;
    if (!vistos.add(n)) return false;
    activos.add(n);
    for (var destino : g.getOrDefault(n, List.of())) if (visitar(destino,g,activos,vistos)) return true;
    activos.remove(n); return false;
  }
  public static void main(String[] args) {
    var g=Map.of("envios",List.of("facturacion"),"facturacion",List.of("notificaciones"),"notificaciones",List.of("envios"));
    System.out.println("ciclo=" + visitar("envios",g,new HashSet<>(),new HashSet<>()));
  }
}
