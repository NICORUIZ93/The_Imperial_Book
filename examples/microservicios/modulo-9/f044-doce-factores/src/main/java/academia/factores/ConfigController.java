package academia.factores;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Factor VI (procesos sin estado): no guarda nada entre peticiones; cualquier réplica responde igual. */
@RestController
class ConfigController {

    private static final Logger log = LoggerFactory.getLogger(ConfigController.class);
    private final TiendaProperties tienda;

    ConfigController(TiendaProperties tienda) {
        this.tienda = tienda;
    }

    @GetMapping("/config")
    Map<String, Object> config() {
        // Factor XI (logs): se escribe en la salida estándar; la plataforma recoge y enruta el flujo.
        log.info("consulta de configuración moneda={} descuentoMaximo={}", tienda.moneda(), tienda.descuentoMaximo());
        return Map.of("moneda", tienda.moneda(), "descuentoMaximo", tienda.descuentoMaximo());
    }
}
