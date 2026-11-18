package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
    private static final String CLAVE_DE_PRUEBA = "VVFRc3BzQVFzZXJ0T0xhbkt0ZUd4cHlsU21pSnhhOFM=";

    @Test
    void tokenFirmadoConservaUsuarioYRol() {
        var service = new JwtService(new JwtSettings(CLAVE_DE_PRUEBA, 120));
        var claims = service.validar(service.generar("ana-1", "ADMIN"));
        assertEquals("ana-1", claims.getSubject());
        assertEquals("ADMIN", claims.get("rol", String.class));
    }
}
