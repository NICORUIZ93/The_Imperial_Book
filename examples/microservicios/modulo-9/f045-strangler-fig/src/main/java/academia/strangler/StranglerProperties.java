package academia.strangler;

import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** strangler.destinos.* (nombre -> URL base) y strangler.rutas (lista "prefijo->destino"). */
@ConfigurationProperties("strangler")
public record StranglerProperties(Map<String, String> destinos, List<String> rutas) {
}
