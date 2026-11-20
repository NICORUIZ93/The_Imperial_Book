package academia.seguridad.vault;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ConfigPagosController {

    private final String apiKey;
    private final String origen;

    ConfigPagosController(@Value("${tienda.pagos.api-key}") String apiKey,
                          @Value("${spring.cloud.vault.enabled:true}") boolean conVault) {
        this.apiKey = apiKey;
        this.origen = conVault ? "vault" : "archivo de propiedades";
    }

    /** Nunca devuelvas ni registres el secreto: una huella basta para comprobar cuál se cargó. */
    @GetMapping("/config/pagos")
    Map<String, String> config() throws Exception {
        byte[] h = MessageDigest.getInstance("SHA-256").digest(apiKey.getBytes(StandardCharsets.UTF_8));
        return Map.of("origen", origen, "huella", "sha256:" + HexFormat.of().formatHex(h).substring(0, 12));
    }
}
