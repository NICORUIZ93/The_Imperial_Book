package academia.observabilidad.logs;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PagosController {

    private static final Logger log = LoggerFactory.getLogger(PagosController.class);

    /**
     * DESPUÉS: un mensaje fijo y los datos como campos. pedidoId va al MDC (lo heredan todos los logs de la
     * petición) y canal/importe se añaden con la API fluida de SLF4J (addKeyValue). El correo nunca se registra.
     */
    @PostMapping("/pedidos/{id}/pagar")
    ResponseEntity<Map<String, String>> pagar(@PathVariable String id, @RequestParam String canal,
                                              @RequestParam long importe, @RequestParam String email) {
        try (MDC.MDCCloseable ignorado = MDC.putCloseable("pedidoId", id)) {
            if (importe > 5_000_000) {
                log.atWarn().addKeyValue("canal", canal).addKeyValue("importe", importe)
                    .log("pago rechazado por tope de importe");
                return ResponseEntity.unprocessableEntity().body(Map.of("estado", "rechazado"));
            }
            log.atInfo().addKeyValue("canal", canal).addKeyValue("importe", importe).log("pedido confirmado");
            return ResponseEntity.ok(Map.of("estado", "confirmado"));
        }
    }
}
