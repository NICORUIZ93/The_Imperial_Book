import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public final class CompatibilidadContrato {
  private CompatibilidadContrato() { }
  public static void main(String[] args) throws Exception {
    for (String file : args) {
      String json = Files.readString(Path.of(file), StandardCharsets.UTF_8);
      if (!json.contains("\"id\"") || !json.contains("\"estado\"")) {
        throw new IllegalArgumentException("CONTRATO_INVALIDO");
      }
      String city = json.contains("\"ciudadDestino\"") ? "PRESENTE" : "DESCONOCIDA";
      System.out.println(Path.of(file).getFileName() + " ciudad=" + city);
    }
  }
}
