package academia.seguridad.jwt;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/** Emite tokens de prueba como lo haría el servidor de autorización (que es quien tiene la clave privada). */
final class FabricaDeTokens {

    private FabricaDeTokens() { }

    static String pem(String ruta) throws Exception {
        return new ClassPathResource(ruta).getContentAsString(StandardCharsets.UTF_8);
    }

    static byte[] der(String pem) {
        return Base64.getMimeDecoder().decode(pem.replaceAll("-----[A-Z ]+-----", ""));
    }

    static RSAPublicKey publica() throws Exception {
        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(der(pem("claves/publica.pem"))));
    }

    static RSAPrivateKey privada() throws Exception {
        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
            .generatePrivate(new PKCS8EncodedKeySpec(der(pem("claves/privada-solo-pruebas.pem"))));
    }

    static JwtClaimsSet claims(String aud, Instant exp) {
        return JwtClaimsSet.builder().issuer(JwtConfig.EMISOR).subject("ana").audience(List.of(aud))
            .issuedAt(exp.minusSeconds(600)).expiresAt(exp).build();
    }

    static String rs256(String aud, Instant exp) throws Exception {
        RSAKey jwk = new RSAKey.Builder(publica()).privateKey(privada()).keyID("clave-2026-11").build();
        var encoder = new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), claims(aud, exp)))
            .getTokenValue();
    }

    static String hs256(String secreto, String aud) {
        var clave = new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        var encoder = new NimbusJwtEncoder(new ImmutableSecret<>(clave));
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),
            claims(aud, Instant.now().plusSeconds(300)))).getTokenValue();
    }

    // ---- Tokens de ataque, hechos a mano porque ninguna librería seria los emite ----
    static String b64(String s) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    static String cuerpoAtacante() {
        return b64("{\"iss\":\"" + JwtConfig.EMISOR + "\",\"sub\":\"admin\",\"aud\":[\"pedidos\"],\"exp\":"
            + Instant.now().plusSeconds(300).getEpochSecond() + "}");
    }

    static String algNone() {
        return b64("{\"alg\":\"none\"}") + "." + cuerpoAtacante() + ".";
    }

    /** Confusión de algoritmo: HMAC firmado usando como "secreto" el PEM de la clave pública (que es pública). */
    static String confusionHs256() throws Exception {
        String datos = b64("{\"alg\":\"HS256\"}") + "." + cuerpoAtacante();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(pem("claves/publica.pem").getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return datos + "." + Base64.getUrlEncoder().withoutPadding()
            .encodeToString(mac.doFinal(datos.getBytes(StandardCharsets.US_ASCII)));
    }
}
