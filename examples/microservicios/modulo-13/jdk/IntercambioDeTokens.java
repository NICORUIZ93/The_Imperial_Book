// F066 · Token Exchange (RFC 8693) — un STS mínimo en memoria, solo JDK 25.
// pedidos recibe el token de ana (aud=pedidos) y necesita llamar a pagos EN NOMBRE de ana.
// ANTES: reenvía el token de ana (token passthrough) y por eso ese token sirve en todos los servicios.
// DESPUÉS: pide al STS un token nuevo con aud=pagos, scope reducido, vida corta y claim "act".
// Ejecuta:  java IntercambioDeTokens.java
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class IntercambioDeTokens {

    static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    static final String ISS = "http://localhost:8180/realms/tienda";
    static final String GRANT = "urn:ietf:params:oauth:grant-type:token-exchange";
    static final String ACCESS = "urn:ietf:params:oauth:token-type:access_token";
    static KeyPair claves;

    record Cliente(String secreto, Set<String> audienciasPermitidas, Set<String> scopesPermitidos) { }

    // Lo que el STS sabe de cada cliente confidencial (en Keycloak: la configuración del cliente).
    static final Map<String, Cliente> CLIENTES = Map.of(
            "pedidos", new Cliente("secreto-pedidos", Set.of("pagos"), Set.of("pagos:cobrar")));

    static String firmar(String claims) throws Exception {
        String datos = B64.encodeToString("{\"alg\":\"RS256\"}".getBytes(StandardCharsets.UTF_8)) + "."
                + B64.encodeToString(claims.getBytes(StandardCharsets.UTF_8));
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initSign(claves.getPrivate());
        s.update(datos.getBytes(StandardCharsets.US_ASCII));
        return datos + "." + B64.encodeToString(s.sign());
    }

    static String claims(String jwt) throws Exception {
        String[] p = jwt.split("\\.");
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initVerify(claves.getPublic());
        s.update((p[0] + "." + p[1]).getBytes(StandardCharsets.US_ASCII));
        if (!s.verify(Base64.getUrlDecoder().decode(p[2]))) throw new SecurityException("firma inválida");
        return new String(Base64.getUrlDecoder().decode(p[1]), StandardCharsets.UTF_8);
    }

    static String campo(String json, String nombre) {
        Matcher m = Pattern.compile("\"" + nombre + "\"\\s*:\\s*(\"([^\"]*)\"|(\\d+)|\\[([^\\]]*)\\]|(\\{[^}]*\\}))").matcher(json);
        if (!m.find()) return "";
        if (m.group(5) != null) return m.group(5);                       // objeto: tal cual
        for (int g = 2; g <= 4; g++) if (m.group(g) != null) return m.group(g).replace("\"", "");
        return "";
    }

    static Set<String> lista(String valor, String sep) {
        return Arrays.stream(valor.split(sep)).map(String::trim).filter(x -> !x.isEmpty()).collect(Collectors.toSet());
    }

    // Endpoint de token del STS: valida la petición según RFC 8693 §2.1 y responde según §2.2.
    static Map<String, String> sts(String clientId, String secreto, Map<String, String> form) throws Exception {
        Cliente c = CLIENTES.get(clientId);
        if (c == null || !c.secreto().equals(secreto)) return Map.of("error", "invalid_client");
        if (!GRANT.equals(form.get("grant_type")) || !ACCESS.equals(form.get("subject_token_type")))
            return Map.of("error", "invalid_request");
        String sujeto;
        try { sujeto = claims(form.get("subject_token")); } catch (SecurityException e) { return Map.of("error", "invalid_grant"); }
        if (Long.parseLong(campo(sujeto, "exp")) < Instant.now().getEpochSecond()) return Map.of("error", "invalid_grant");
        if (!lista(campo(sujeto, "aud"), ",").contains(clientId)) return Map.of("error", "invalid_grant"); // el token iba para otro
        String audiencia = form.get("audience");
        if (!c.audienciasPermitidas().contains(audiencia)) return Map.of("error", "invalid_target");
        Set<String> pedidos = lista(form.getOrDefault("scope", ""), " ");
        Set<String> concedidos = pedidos.stream().filter(c.scopesPermitidos()::contains).collect(Collectors.toSet());
        if (concedidos.isEmpty()) return Map.of("error", "invalid_scope");
        long ahora = Instant.now().getEpochSecond();
        String nuevo = firmar("{\"iss\":\"" + ISS + "\",\"sub\":\"" + campo(sujeto, "sub") + "\",\"aud\":\"" + audiencia
                + "\",\"scope\":\"" + String.join(" ", concedidos) + "\",\"act\":{\"sub\":\"" + clientId + "\"},\"exp\":"
                + (ahora + 60) + "}");
        Map<String, String> r = new LinkedHashMap<>();
        r.put("access_token", nuevo);
        r.put("issued_token_type", ACCESS);
        r.put("token_type", "Bearer");
        r.put("expires_in", "60");
        return r;
    }

    // ANTES: el servicio solo comprueba la firma. DESPUÉS: firma + aud propia + scope.
    static String servicio(String nombre, String token, String scopeRequerido, boolean estricto) {
        try {
            String c = claims(token);
            if (estricto && !lista(campo(c, "aud"), ",").contains(nombre)) return "401 (aud=" + campo(c, "aud") + ")";
            if (estricto && !lista(campo(c, "scope"), " ").contains(scopeRequerido)) return "403 (falta " + scopeRequerido + ")";
            return "200 sub=" + campo(c, "sub");
        } catch (Exception e) { return "401 (" + e.getMessage() + ")"; }
    }

    public static void main(String[] args) throws Exception {
        KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        claves = g.generateKeyPair();
        long exp = Instant.now().getEpochSecond() + 300;
        int fallos = 0;

        System.out.println("ANTES (vulnerable): token de ana con aud amplia, reenviado tal cual");
        String amplio = firmar("{\"iss\":\"" + ISS + "\",\"sub\":\"ana\",\"aud\":[\"pedidos\",\"pagos\",\"inventario\"],"
                + "\"scope\":\"pedidos:crear pagos:cobrar inventario:ajustar\",\"exp\":" + exp + "}");
        for (String s : List.of("pagos", "inventario")) {
            String r = servicio(s, amplio, s.equals("pagos") ? "pagos:cobrar" : "inventario:ajustar", false);
            System.out.println("  " + s + " acepta el token reenviado por pedidos -> " + r);
            if (!r.startsWith("200")) fallos++;
        }
        System.out.println("  si ese token se filtra en un log de pedidos, abre pagos E inventario durante 5 minutos");

        System.out.println("DESPUÉS (seguro): RFC 8693 en el STS");
        String deAna = firmar("{\"iss\":\"" + ISS + "\",\"sub\":\"ana\",\"aud\":\"pedidos\","
                + "\"scope\":\"pedidos:crear\",\"exp\":" + exp + "}");
        Map<String, String> form = new LinkedHashMap<>();
        form.put("grant_type", GRANT);
        form.put("subject_token", deAna);
        form.put("subject_token_type", ACCESS);
        form.put("audience", "pagos");
        form.put("scope", "pagos:cobrar pagos:reembolsar");
        System.out.println("  POST /token (client pedidos) grant_type=" + GRANT);
        System.out.println("    audience=pagos scope=\"pagos:cobrar pagos:reembolsar\" subject_token=<token de ana>");
        Map<String, String> resp = sts("pedidos", "secreto-pedidos", form);
        String canjeado = resp.get("access_token");
        String c = claims(canjeado);
        System.out.println("  respuesta: issued_token_type=" + resp.get("issued_token_type") + " token_type="
                + resp.get("token_type") + " expires_in=" + resp.get("expires_in"));
        System.out.println("  claims nuevos: sub=" + campo(c, "sub") + " aud=" + campo(c, "aud") + " scope=\""
                + campo(c, "scope") + "\" act=" + campo(c, "act"));
        String enPagos = servicio("pagos", canjeado, "pagos:cobrar", true);
        String enInventario = servicio("inventario", canjeado, "inventario:ajustar", true);
        String originalEnPagos = servicio("pagos", deAna, "pagos:cobrar", true);
        System.out.println("  pagos con el token canjeado      -> " + enPagos);
        System.out.println("  inventario con el token canjeado -> " + enInventario);
        System.out.println("  pagos con el token original      -> " + originalEnPagos);
        if (!enPagos.startsWith("200") || !enInventario.startsWith("401") || !originalEnPagos.startsWith("401")) fallos++;

        System.out.println("  peticiones que el STS rechaza:");
        Map<String, Map<String, String>> malos = new LinkedHashMap<>();
        malos.put("secreto de cliente incorrecto", sts("pedidos", "otro", form));
        Map<String, String> f2 = new LinkedHashMap<>(form); f2.put("audience", "inventario");
        malos.put("audience no permitida (inventario)", sts("pedidos", "secreto-pedidos", f2));
        Map<String, String> f3 = new LinkedHashMap<>(form);
        f3.put("subject_token", firmar("{\"iss\":\"" + ISS + "\",\"sub\":\"ana\",\"aud\":\"facturas\",\"exp\":" + exp + "}"));
        malos.put("subject_token emitido para facturas", sts("pedidos", "secreto-pedidos", f3));
        Map<String, String> f4 = new LinkedHashMap<>(form); f4.put("scope", "pagos:reembolsar");
        malos.put("solo scopes no permitidos", sts("pedidos", "secreto-pedidos", f4));
        List<String> esperados = List.of("invalid_client", "invalid_target", "invalid_grant", "invalid_scope");
        int i = 0;
        for (var e : malos.entrySet()) {
            System.out.printf("    %-36s -> %s%n", e.getKey(), e.getValue().get("error"));
            if (!esperados.get(i++).equals(e.getValue().get("error"))) fallos++;
        }
        System.out.println(fallos == 0 ? "OK: el token canjeado solo sirve en pagos, con pagos:cobrar y act.sub=pedidos" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
