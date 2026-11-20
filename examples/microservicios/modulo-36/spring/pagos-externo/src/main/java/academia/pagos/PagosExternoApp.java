package academia.pagos;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Módulo 32 · F181 · Simulador del proveedor de pagos EXTERNO (mismo contrato que proveedor-pagos.js de la pista Node):
 * POST /cobros y POST /reembolsos con cabecera Idempotency-Key; 402 si la tarjeta es 4000-RECHAZAR; 429 con
 * Retry-After: 1 si se supera pagos.limite-rps en el segundo en curso.
 */
@SpringBootApplication
@RestController
public class PagosExternoApp {

    record Cobro(String reservaId, int importe, String tarjeta) { }
    record Reembolso(String cobroId) { }

    private final Map<String, ResponseEntity<Map<String, Object>>> porClave = new ConcurrentHashMap<>();
    private final int limiteRps;
    private long ventana;
    private int enVentana;

    PagosExternoApp(@Value("${pagos.limite-rps}") int limiteRps) {
        this.limiteRps = limiteRps;
    }

    public static void main(String[] args) {
        SpringApplication.run(PagosExternoApp.class, args);
    }

    /** Ventana fija de 1 segundo, como anuncian muchos proveedores. */
    private synchronized boolean dentroDelLimite() {
        long ahora = System.currentTimeMillis() / 1000;
        if (ahora != ventana) {
            ventana = ahora;
            enVentana = 0;
        }
        return ++enVentana <= limiteRps;
    }

    @PostMapping("/cobros")
    ResponseEntity<Map<String, Object>> cobrar(@RequestHeader("Idempotency-Key") String clave, @RequestBody Cobro c) {
        if (!dentroDelLimite()) {
            return ResponseEntity.status(429).header("Retry-After", "1")
                    .body(Map.of("error", "límite de " + limiteRps + " peticiones/s superado"));
        }
        // computeIfAbsent: la misma Idempotency-Key devuelve la misma respuesta y no cobra dos veces.
        return porClave.computeIfAbsent("cobro:" + clave, k -> "4000-RECHAZAR".equals(c.tarjeta())
                ? ResponseEntity.status(402).body(Map.of("estado", "RECHAZADO", "motivo", "fondos insuficientes"))
                : ResponseEntity.status(201).body(Map.of("cobroId", "CB-" + c.reservaId(), "estado", "APROBADO", "importe", c.importe())));
    }

    @PostMapping("/reembolsos")
    ResponseEntity<Map<String, Object>> reembolsar(@RequestHeader("Idempotency-Key") String clave, @RequestBody Reembolso r) {
        if (!dentroDelLimite()) {
            return ResponseEntity.status(429).header("Retry-After", "1").body(Map.of("error", "límite superado"));
        }
        return porClave.computeIfAbsent("reembolso:" + clave,
                k -> ResponseEntity.status(201).body(Map.of("cobroId", r.cobroId(), "estado", "REEMBOLSADO")));
    }
}
