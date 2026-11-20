// F063 · OAuth2 y OIDC — flujo Authorization Code con PKCE y validación del id_token, solo JDK 25.
// Levanta un servidor de autorización mínimo en memoria (/authorize y /token) y lo usa como cliente.
// ANTES: sin PKCE ni state, quien intercepte el "code" lo canjea por tokens.
// DESPUÉS: con PKCE (S256), state y nonce, el code robado no sirve y el id_token se valida.
// Ejecuta:  java OAuthPkce.java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.Signature;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class OAuthPkce {

    static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    static final SecureRandom AZAR = new SecureRandom();
    static final String ISS = "http://auth.tienda.local/realms/tienda";

    record Codigo(String clientId, String redirectUri, String challenge, String nonce, String usuario) { }

    // ---------- Servidor de autorización mínimo (lo que hace Keycloak, F064) ----------
    static class Autorizacion {
        final Map<String, Codigo> codigos = new ConcurrentHashMap<>();
        final KeyPair claves;
        final HttpServer http;

        Autorizacion() throws Exception {
            KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
            g.initialize(2048);
            claves = g.generateKeyPair();
            http = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            http.createContext("/authorize", this::autorizar);
            http.createContext("/token", this::token);
            http.start();
        }

        String base() { return "http://127.0.0.1:" + http.getAddress().getPort(); }

        // El usuario ya inició sesión como "ana" y aceptó: se emite un code de un solo uso.
        void autorizar(HttpExchange ex) throws IOException {
            Map<String, String> q = parametros(ex.getRequestURI().getRawQuery());
            String code = aleatorio(16);
            codigos.put(code, new Codigo(q.get("client_id"), q.get("redirect_uri"), q.get("code_challenge"),
                    q.get("nonce"), "ana"));
            String destino = q.get("redirect_uri") + "?code=" + code
                    + (q.containsKey("state") ? "&state=" + enc(q.get("state")) : "");
            ex.getResponseHeaders().add("Location", destino);
            ex.sendResponseHeaders(302, -1);
            ex.close();
        }

        void token(HttpExchange ex) throws IOException {
            Map<String, String> f = parametros(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            Codigo c = codigos.remove(f.get("code"));                       // un solo uso
            String error = null;
            if (c == null) error = "invalid_grant";
            else if (!c.redirectUri().equals(f.get("redirect_uri")) || !c.clientId().equals(f.get("client_id"))) error = "invalid_grant";
            else if (c.challenge() != null && (f.get("code_verifier") == null
                    || !c.challenge().equals(s256(f.get("code_verifier"))))) error = "invalid_grant";
            if (error != null) {
                responder(ex, 400, "{\"error\":\"" + error + "\"}");
                return;
            }
            long ahora = Instant.now().getEpochSecond();
            String access = firmar("{\"iss\":\"" + ISS + "\",\"sub\":\"" + c.usuario() + "\",\"aud\":\"api-pedidos\","
                    + "\"scope\":\"openid pedidos:leer\",\"exp\":" + (ahora + 300) + "}");
            String id = firmar("{\"iss\":\"" + ISS + "\",\"sub\":\"" + c.usuario() + "\",\"aud\":\"" + c.clientId()
                    + "\",\"nonce\":\"" + c.nonce() + "\",\"name\":\"Ana Ruiz\",\"exp\":" + (ahora + 300) + "}");
            responder(ex, 200, "{\"access_token\":\"" + access + "\",\"id_token\":\"" + id
                    + "\",\"token_type\":\"Bearer\",\"expires_in\":300}");
        }

        String firmar(String claims) {
            try {
                String datos = B64.encodeToString("{\"alg\":\"RS256\",\"kid\":\"k1\"}".getBytes(StandardCharsets.UTF_8))
                        + "." + B64.encodeToString(claims.getBytes(StandardCharsets.UTF_8));
                Signature s = Signature.getInstance("SHA256withRSA");
                s.initSign(claves.getPrivate());
                s.update(datos.getBytes(StandardCharsets.US_ASCII));
                return datos + "." + B64.encodeToString(s.sign());
            } catch (Exception e) { throw new IllegalStateException(e); }
        }
    }

    // ---------- Utilidades ----------
    static String aleatorio(int bytes) { byte[] b = new byte[bytes]; AZAR.nextBytes(b); return B64.encodeToString(b); }
    static String enc(String s) { return URLEncoder.encode(s, StandardCharsets.UTF_8); }
    static String s256(String verifier) {
        try {
            return B64.encodeToString(MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    static Map<String, String> parametros(String q) {
        Map<String, String> m = new HashMap<>();
        if (q == null || q.isEmpty()) return m;
        for (String par : q.split("&")) {
            String[] kv = par.split("=", 2);
            m.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8), kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "");
        }
        return m;
    }
    static void responder(HttpExchange ex, int codigo, String json) throws IOException {
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.sendResponseHeaders(codigo, b.length);
        ex.getResponseBody().write(b);
        ex.close();
    }
    static String campo(String json, String nombre) {
        Matcher m = Pattern.compile("\"" + nombre + "\"\\s*:\\s*(\"([^\"]*)\"|(\\d+))").matcher(json);
        return m.find() ? (m.group(2) != null ? m.group(2) : m.group(3)) : null;
    }

    static HttpClient HTTP = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();

    static Map<String, String> irAAutorizar(Autorizacion as, String query) throws Exception {
        var r = HTTP.send(HttpRequest.newBuilder(URI.create(as.base() + "/authorize?" + query)).build(),
                HttpResponse.BodyHandlers.discarding());
        return parametros(URI.create(r.headers().firstValue("Location").orElseThrow()).getRawQuery());
    }

    static HttpResponse<String> canjear(Autorizacion as, String form) throws Exception {
        return HTTP.send(HttpRequest.newBuilder(URI.create(as.base() + "/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form)).build(), HttpResponse.BodyHandlers.ofString());
    }

    // OIDC: el cliente valida el id_token antes de dar por iniciada la sesión.
    static String validarIdToken(String idToken, Autorizacion as, String clientId, String nonce) throws Exception {
        String[] p = idToken.split("\\.");
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initVerify(as.claves.getPublic());
        s.update((p[0] + "." + p[1]).getBytes(StandardCharsets.US_ASCII));
        if (!s.verify(Base64.getUrlDecoder().decode(p[2]))) return "firma inválida";
        String c = new String(Base64.getUrlDecoder().decode(p[1]), StandardCharsets.UTF_8);
        if (!ISS.equals(campo(c, "iss"))) return "iss inválido";
        if (!clientId.equals(campo(c, "aud"))) return "aud inválido";
        if (!nonce.equals(campo(c, "nonce"))) return "nonce inválido";
        if (Long.parseLong(campo(c, "exp")) < Instant.now().getEpochSecond()) return "expirado";
        return "válido: sub=" + campo(c, "sub") + " name=" + campo(c, "name");
    }

    public static void main(String[] args) throws Exception {
        Autorizacion as = new Autorizacion();
        String cliente = "tienda-web", redirect = "http://localhost:8080/login/oauth2/code/keycloak";
        int fallos = 0;

        System.out.println("ANTES (vulnerable): Authorization Code sin PKCE ni state");
        Map<String, String> vuelta = irAAutorizar(as, "response_type=code&client_id=" + cliente
                + "&redirect_uri=" + enc(redirect) + "&scope=openid");
        String robado = vuelta.get("code");
        System.out.println("  un atacante intercepta la redirección y lee code=" + robado.substring(0, 6) + "…");
        var rob = canjear(as, "grant_type=authorization_code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
                + "&code=" + robado);
        System.out.println("  el atacante canjea el code -> HTTP " + rob.statusCode() + " con access_token: "
                + (campo(rob.body(), "access_token") != null));
        if (rob.statusCode() != 200) fallos++;

        System.out.println("DESPUÉS (seguro): PKCE S256 + state + nonce + validación del id_token");
        String verifier = aleatorio(32), state = aleatorio(16), nonce = aleatorio(16);
        String challenge = s256(verifier);
        boolean vectorRfc = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM".equals(s256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"));
        System.out.println("  S256 coincide con el vector de prueba del RFC 7636 (apéndice B): " + vectorRfc);
        if (!vectorRfc) fallos++;
        System.out.println("  code_verifier (secreto del cliente, " + verifier.length() + " caracteres) -> code_challenge="
                + challenge.substring(0, 10) + "…");
        vuelta = irAAutorizar(as, "response_type=code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
                + "&scope=openid&state=" + enc(state) + "&nonce=" + enc(nonce)
                + "&code_challenge=" + challenge + "&code_challenge_method=S256");
        boolean stateOk = state.equals(vuelta.get("state"));
        System.out.println("  state devuelto coincide: " + stateOk);
        String code = vuelta.get("code");
        var intento = canjear(as, "grant_type=authorization_code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
                + "&code=" + code + "&code_verifier=" + aleatorio(32));
        System.out.println("  atacante con el code pero sin el verifier -> HTTP " + intento.statusCode() + " " + intento.body());
        // El code se consumió con el intento fallido: el cliente legítimo repite el flujo.
        vuelta = irAAutorizar(as, "response_type=code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
                + "&scope=openid&state=" + enc(state) + "&nonce=" + enc(nonce)
                + "&code_challenge=" + challenge + "&code_challenge_method=S256");
        var bueno = canjear(as, "grant_type=authorization_code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
                + "&code=" + vuelta.get("code") + "&code_verifier=" + verifier);
        System.out.println("  cliente legítimo con el verifier -> HTTP " + bueno.statusCode());
        String id = validarIdToken(campo(bueno.body(), "id_token"), as, cliente, nonce);
        System.out.println("  id_token (OIDC, para el cliente): " + id);
        String otro = validarIdToken(campo(bueno.body(), "id_token"), as, cliente, "nonce-de-otra-sesion");
        System.out.println("  mismo id_token en otra sesión: " + otro);
        String access = campo(bueno.body(), "access_token");
        String claimsAccess = new String(Base64.getUrlDecoder().decode(access.split("\\.")[1]), StandardCharsets.UTF_8);
        System.out.println("  access_token (OAuth2, para la API): aud=" + campo(claimsAccess, "aud")
                + " scope=\"" + campo(claimsAccess, "scope") + "\"");
        if (!stateOk || intento.statusCode() != 400 || bueno.statusCode() != 200 || !id.startsWith("válido")
                || !otro.equals("nonce inválido")) fallos++;
        as.http.stop(0);
        System.out.println(fallos == 0 ? "OK: sin PKCE el code robado sirve; con PKCE no, y el id_token se valida" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
