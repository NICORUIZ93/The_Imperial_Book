// F064 · Keycloak — muestra la cabecera y los claims de un JWT (por ejemplo, el que emite Keycloak).
// Solo decodifica: NO verifica la firma (eso lo hace el resource server con la JWKS del realm).
// Uso:  java VerToken.java "$TOKEN"      o      echo "$TOKEN" | java VerToken.java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VerToken {

    static String decodificar(String parte) {
        return new String(Base64.getUrlDecoder().decode(parte), StandardCharsets.UTF_8);
    }

    // Busca "nombre": "texto" | número | [lista] | {objeto plano} sin depender de una librería JSON.
    static String campo(String json, String nombre) {
        Matcher m = Pattern.compile("\"" + Pattern.quote(nombre) + "\"\\s*:\\s*(\"[^\"]*\"|\\d+|\\[[^\\]]*\\]|\\{[^}]*\\})")
                .matcher(json);
        return m.find() ? m.group(1) : "(no está)";
    }

    public static void main(String[] args) throws Exception {
        String token = args.length > 0 ? args[0]
                : new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8)).readLine();
        String[] p = token.trim().split("\\.");
        if (p.length != 3) {
            System.err.println("No parece un JWT: tiene " + p.length + " partes separadas por punto (deben ser 3)");
            System.exit(2);
        }
        String cabecera = decodificar(p[0]);
        String claims = decodificar(p[1]);
        System.out.println("cabecera: " + cabecera);
        for (String c : List.of("iss", "sub", "aud", "azp", "scope", "preferred_username", "realm_access", "act")) {
            System.out.printf("%-19s %s%n", c + ":", campo(claims, c));
        }
        String exp = campo(claims, "exp");
        if (exp.matches("\\d+")) {
            long resta = Long.parseLong(exp) - Instant.now().getEpochSecond();
            System.out.printf("%-19s %s (%s)%n", "exp:", Instant.ofEpochSecond(Long.parseLong(exp)),
                    resta > 0 ? "vence en " + resta + " s" : "VENCIDO hace " + (-resta) + " s");
        }
    }
}
