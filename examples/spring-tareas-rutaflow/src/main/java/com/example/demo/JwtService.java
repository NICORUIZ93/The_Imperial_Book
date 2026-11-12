package com.example.demo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(JwtSettings settings) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(settings.secretBase64()));
        this.expirationSeconds = settings.expirationSeconds();
    }

    public String generar(String usuario, String rol) {
        Instant ahora = Instant.now();
        return Jwts.builder()
            .subject(usuario)
            .claim("rol", rol)
            .issuedAt(Date.from(ahora))
            .expiration(Date.from(ahora.plusSeconds(expirationSeconds)))
            .signWith(key)
            .compact();
    }

    public Claims validar(String token) {
        return Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).getPayload();
    }
}
