package academia.factores;

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

    /** Un record conserva el orden de los campos en el JSON (un Map.of no lo garantiza). */
    record Config(String moneda, int descuentoMaximo) {
    }

    @GetMapping("/config")
    Config config() {
        // Factor XI (logs): se escribe en la salida estándar; la plataforma recoge y enruta el flujo.
        log.info("consulta de configuración moneda={} descuentoMaximo={}", tienda.moneda(), tienda.descuentoMaximo());
        return new Config(tienda.moneda(), tienda.descuentoMaximo());
    }
}
