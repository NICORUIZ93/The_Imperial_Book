import java.util.HashMap;
import java.util.Map;

public final class SustituirAdaptador {
  record Envio(String id, String estado) { }
  interface GuardarEnvio { void guardar(Envio envio); }
  static final class Memoria implements GuardarEnvio {
    final Map<String, Envio> datos = new HashMap<>();
    public void guardar(Envio envio) { datos.put(envio.id(), envio); }
  }
  static final class RegistrarEnvio {
    private final GuardarEnvio salida;
    RegistrarEnvio(GuardarEnvio salida) { this.salida = salida; }
    Envio ejecutar(String id) { var envio = new Envio(id, "REGISTRADO"); salida.guardar(envio); return envio; }
  }
  public static void main(String[] args) {
    var memoria = new Memoria();
    System.out.println(new RegistrarEnvio(memoria).ejecutar("env-7"));
    System.out.println("guardados=" + memoria.datos.size());
  }
}
