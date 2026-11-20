package academia.seguridad.vault;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Necesita el Vault del laboratorio sembrado:
 *   docker compose up -d --wait vault && export VAULT_TOKEN=$(./vault/sembrar.sh)
 */
@SpringBootTest
class SecretoDesdeVaultTest {

    @Value("${tienda.pagos.api-key}") String apiKey;
    @Autowired ConfigPagosController controller;

    @Test
    void elSecretoLlegaDesdeVault() {
        assertThat(apiKey).isEqualTo("clave-de-pagos-desde-vault");
    }

    @Test
    void elEndpointSoloMuestraUnaHuella() throws Exception {
        Map<String, String> r = controller.config();
        String esperado = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
            .digest("clave-de-pagos-desde-vault".getBytes(StandardCharsets.UTF_8))).substring(0, 12);
        assertThat(r).containsEntry("origen", "vault").containsEntry("huella", "sha256:" + esperado);
        assertThat(r.values()).noneMatch(v -> v.contains("clave-de-pagos"));
    }
}
