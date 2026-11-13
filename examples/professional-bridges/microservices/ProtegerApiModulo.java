public final class ProtegerApiModulo {
  public interface RegistrarEnvio {
    Resultado registrar(Comando comando);
  }
  public record Comando(String referencia, int kilometros) { }
  public record Resultado(String id, String estado) { }

  private static final class ServicioEnvios implements RegistrarEnvio {
    public Resultado registrar(Comando comando) {
      if (comando.referencia() == null || comando.referencia().isBlank())
        throw new IllegalArgumentException("referencia obligatoria");
      return new Resultado("env-001", "REGISTRADO");
    }
  }

  public static void main(String[] args) {
    RegistrarEnvio api = new ServicioEnvios();
    System.out.println(api.registrar(new Comando("REF-7", 12)));
    System.out.println("contrato=" + RegistrarEnvio.class.getSimpleName());
  }
}
