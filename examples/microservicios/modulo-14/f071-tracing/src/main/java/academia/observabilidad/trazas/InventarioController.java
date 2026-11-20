package academia.observabilidad.trazas;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class InventarioController {

    private static final Logger log = LoggerFactory.getLogger(InventarioController.class);

    @GetMapping("/stock/{sku}")
    Map<String, Object> stock(@PathVariable String sku) throws InterruptedException {
        log.info("consultando stock de {}", sku);
        Thread.sleep(30);
        return Map.of("sku", sku, "stock", 12);
    }
}
