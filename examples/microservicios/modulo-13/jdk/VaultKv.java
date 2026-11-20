// F068 · HashiCorp Vault — lee un secreto del motor KV v2 con la API HTTP, solo JDK 25.
// Es la misma llamada que hace Spring Cloud Vault al arrancar (GET /v1/<montaje>/data/<ruta>).
// Requiere el Vault del laboratorio:  docker compose up -d --wait vault  y  ./vault/sembrar.sh
// Uso:  VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root-solo-dev java VaultKv.java secret f068-pagos
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VaultKv {
    public static void main(String[] args) throws Exception {
        String direccion = System.getenv().getOrDefault("VAULT_ADDR", "http://127.0.0.1:8200");
        String token = System.getenv("VAULT_TOKEN");           // nunca en el código ni en un argumento
        if (token == null) { System.err.println("Define VAULT_TOKEN"); System.exit(2); }
        String montaje = args.length > 0 ? args[0] : "secret", ruta = args.length > 1 ? args[1] : "f068-pagos";
        HttpResponse<String> r = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create(direccion + "/v1/" + montaje + "/data/" + ruta))
                        .header("X-Vault-Token", token).build(),
                HttpResponse.BodyHandlers.ofString());
        System.out.println("HTTP " + r.statusCode());
        if (r.statusCode() != 200) { System.out.println(r.body()); System.exit(1); }
        // KV v2 responde {"data":{"data":{...secretos...},"metadata":{"version":N,...}}}
        Matcher datos = Pattern.compile("\"data\":\\{\"data\":(\\{[^}]*\\})").matcher(r.body());
        Matcher version = Pattern.compile("\"version\":(\\d+)").matcher(r.body());
        String claves = datos.find() ? datos.group(1).replaceAll(":\"[^\"]*\"", ":\"****\"") : "(sin datos)";
        System.out.println("claves (valores ocultos): " + claves);
        System.out.println("versión del secreto: " + (version.find() ? version.group(1) : "?"));
    }
}
