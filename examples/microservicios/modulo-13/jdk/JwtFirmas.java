// F062 · JWT: firmas simétricas (HS256) vs asimétricas (RS256), solo con JDK 25.
// Muestra cómo se firma y verifica cada una, y dos ataques contra un verificador ingenuo:
// "alg":"none" y la confusión de algoritmo (RS256 -> HS256 usando la clave pública como secreto).
// Ejecuta:  java JwtFirmas.java            (escribe target/hs256.jwt para comprobarlo con PyJWT)
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class JwtFirmas {

    static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    static final Base64.Decoder D64 = Base64.getUrlDecoder();

    static String b64(String s) { return B64.encodeToString(s.getBytes(StandardCharsets.UTF_8)); }
    static String texto(String b) { return new String(D64.decode(b), StandardCharsets.UTF_8); }

    static byte[] hmac(byte[] secreto, String datos) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secreto, "HmacSHA256"));
        return mac.doFinal(datos.getBytes(StandardCharsets.US_ASCII));
    }

    static String firmarHs256(byte[] secreto, String claims) throws Exception {
        String datos = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}") + "." + b64(claims);
        return datos + "." + B64.encodeToString(hmac(secreto, datos));
    }

    static String firmarRs256(PrivateKey privada, String kid, String claims) throws Exception {
        String datos = b64("{\"alg\":\"RS256\",\"typ\":\"JWT\",\"kid\":\"" + kid + "\"}") + "." + b64(claims);
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initSign(privada);
        s.update(datos.getBytes(StandardCharsets.US_ASCII));
        return datos + "." + B64.encodeToString(s.sign());
    }

    static String campo(String json, String nombre) {
        Matcher m = Pattern.compile("\"" + nombre + "\"\\s*:\\s*(\"([^\"]*)\"|(\\d+))").matcher(json);
        return m.find() ? (m.group(2) != null ? m.group(2) : m.group(3)) : null;
    }

    // ANTES (vulnerable): confía en el "alg" que manda el propio token.
    static boolean verificadorIngenuo(String jwt, PublicKey publica) throws Exception {
        String[] p = jwt.split("\\.", -1);
        String alg = campo(texto(p[0]), "alg");
        String datos = p[0] + "." + p[1];
        return switch (alg) {
            case "none" -> true;                                              // ¡acepta sin firma!
            case "HS256" -> MessageDigest.isEqual(D64.decode(p[2]), hmac(publica.getEncoded(), datos)); // ¡clave pública como secreto!
            case "RS256" -> {
                Signature s = Signature.getInstance("SHA256withRSA");
                s.initVerify(publica);
                s.update(datos.getBytes(StandardCharsets.US_ASCII));
                yield s.verify(D64.decode(p[2]));
            }
            default -> false;
        };
    }

    // DESPUÉS (seguro): el algoritmo lo fija el servidor, no el token; luego valida iss, aud y exp.
    static String verificadorSeguro(String jwt, PublicKey publica, String iss, String aud) throws Exception {
        String[] p = jwt.split("\\.", -1);
        if (p.length != 3) return "rechazado: formato";
        if (!"RS256".equals(campo(texto(p[0]), "alg"))) return "rechazado: alg no permitido";
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initVerify(publica);
        s.update((p[0] + "." + p[1]).getBytes(StandardCharsets.US_ASCII));
        if (p[2].isEmpty() || !s.verify(D64.decode(p[2]))) return "rechazado: firma inválida";
        String claims = texto(p[1]);
        if (!iss.equals(campo(claims, "iss"))) return "rechazado: iss";
        if (!aud.equals(campo(claims, "aud"))) return "rechazado: aud";
        if (Long.parseLong(campo(claims, "exp")) < Instant.now().getEpochSecond()) return "rechazado: expirado";
        return "aceptado sub=" + campo(claims, "sub");
    }

    public static void main(String[] args) throws Exception {
        int fallos = 0;

        // 1 · HS256: el MISMO secreto firma y verifica. Claims fijos para poder compararlo con PyJWT.
        byte[] secreto = "un-secreto-de-al-menos-32-bytes-para-hs256!".getBytes(StandardCharsets.UTF_8);
        String claimsFijos = "{\"iss\":\"https://auth.tienda.local\",\"sub\":\"ana\",\"aud\":\"pedidos\",\"exp\":4102444800}";
        String hs = firmarHs256(secreto, claimsFijos);
        System.out.println("HS256 (" + secreto.length + " bytes de secreto compartido)");
        System.out.println("  token: " + hs);
        String[] partes = hs.split("\\.");
        boolean hsOk = MessageDigest.isEqual(D64.decode(partes[2]), hmac(secreto, partes[0] + "." + partes[1]));
        System.out.println("  verificado con el mismo secreto: " + hsOk);
        Files.createDirectories(Path.of("target"));
        Files.writeString(Path.of("target/hs256.jwt"), hs);
        if (!hsOk) fallos++;

        // 2 · RS256: firma con la privada (solo el emisor), verifica con la pública (cualquiera).
        KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        KeyPair par = g.generateKeyPair();
        long exp = Instant.now().getEpochSecond() + 300;
        String claims = "{\"iss\":\"https://auth.tienda.local\",\"sub\":\"ana\",\"aud\":\"pedidos\",\"exp\":" + exp + "}";
        String rs = firmarRs256(par.getPrivate(), "clave-2026-11", claims);
        System.out.println("RS256 (RSA 2048, kid=clave-2026-11)");
        System.out.println("  longitud de la firma: " + D64.decode(rs.split("\\.")[2]).length + " bytes (HS256: "
                + D64.decode(partes[2]).length + ")");
        String r1 = verificadorSeguro(rs, par.getPublic(), "https://auth.tienda.local", "pedidos");
        System.out.println("  verificado solo con la clave pública: " + r1);
        if (!r1.startsWith("aceptado")) fallos++;

        // 3 · Ataques: el atacante escribe sus propios claims (sub=admin).
        String claimsAtacante = "{\"iss\":\"https://auth.tienda.local\",\"sub\":\"admin\",\"aud\":\"pedidos\",\"exp\":" + exp + "}";
        String sinFirma = b64("{\"alg\":\"none\"}") + "." + b64(claimsAtacante) + ".";
        String confusion = b64("{\"alg\":\"HS256\"}") + "." + b64(claimsAtacante);
        confusion = confusion + "." + B64.encodeToString(hmac(par.getPublic().getEncoded(), confusion));
        String alterado = rs.split("\\.")[0] + "." + b64(claimsAtacante) + "." + rs.split("\\.")[2];
        System.out.println("ANTES (vulnerable): el verificador lee el alg del token");
        for (var c : List.of(List.of("alg=none", sinFirma), List.of("HS256 con la clave pública", confusion),
                List.of("payload alterado", alterado))) {
            boolean acepta = verificadorIngenuo(c.get(1), par.getPublic());
            System.out.printf("  %-28s -> %s%n", c.get(0), acepta ? "ACEPTADO (sub=admin)" : "rechazado");
        }
        System.out.println("DESPUÉS (seguro): alg fijo RS256 + iss + aud + exp");
        for (var c : List.of(List.of("alg=none", sinFirma), List.of("HS256 con la clave pública", confusion),
                List.of("payload alterado", alterado))) {
            String r = verificadorSeguro(c.get(1), par.getPublic(), "https://auth.tienda.local", "pedidos");
            System.out.printf("  %-28s -> %s%n", c.get(0), r);
            if (r.startsWith("aceptado")) fallos++;
        }
        String otraAudiencia = firmarRs256(par.getPrivate(), "clave-2026-11", claims.replace("pedidos", "pagos"));
        String r2 = verificadorSeguro(otraAudiencia, par.getPublic(), "https://auth.tienda.local", "pedidos");
        System.out.printf("  %-28s -> %s%n", "token válido para \"pagos\"", r2);
        if (r2.startsWith("aceptado")) fallos++;

        // 4 · Secreto HS256 débil: se adivina sin conexión con un diccionario.
        String debil = firmarHs256("secreto".getBytes(StandardCharsets.UTF_8), claimsFijos);
        String[] pd = debil.split("\\.");
        for (String intento : List.of("123456", "password", "admin", "secreto", "qwerty")) {
            if (MessageDigest.isEqual(D64.decode(pd[2]), hmac(intento.getBytes(StandardCharsets.UTF_8), pd[0] + "." + pd[1]))) {
                System.out.println("Secreto HS256 débil adivinado con un diccionario de 5 palabras: \"" + intento + "\"");
            }
        }
        System.out.println(fallos == 0 ? "OK: HS256 y RS256 verifican; el verificador seguro rechaza los 4 ataques" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
