package academia.rutaflow.ownership.jornada;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OwnershipJwtTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtEncoder jwtEncoder;

    @Test
    void sinBearerTokenRecibe401() throws Exception {
        mockMvc.perform(patch("/api/jornadas/jornada-1/posicion"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void conductorPropietarioConTokenFirmadoPuedeActualizar() throws Exception {
        mockMvc.perform(patch("/api/jornadas/jornada-1/posicion")
                .header("Authorization", "Bearer " + token("conductor-A", "ROLE_DRIVER")))
            .andExpect(status().isOk());
    }

    @Test
    void mismoRolPeroOtroPropietarioRecibe403() throws Exception {
        mockMvc.perform(patch("/api/jornadas/jornada-1/posicion")
                .header("Authorization", "Bearer " + token("conductor-B", "ROLE_DRIVER")))
            .andExpect(status().isForbidden());
    }

    @Test
    void propietarioSinRolDriverRecibe403() throws Exception {
        mockMvc.perform(patch("/api/jornadas/jornada-1/posicion")
                .header("Authorization", "Bearer " + token("conductor-A", "ROLE_CUSTOMER")))
            .andExpect(status().isForbidden());
    }

    private String token(String subject, String... roles) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder()
            .issuer("rutaflow-local")
            .subject(subject)
            .issuedAt(now)
            .expiresAt(now.plusSeconds(300))
            .claim("roles", List.of(roles))
            .build();
        var header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
