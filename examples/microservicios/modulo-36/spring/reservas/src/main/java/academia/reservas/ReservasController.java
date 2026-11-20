package academia.reservas;

import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/** Módulo 32 · F181 · API de reservas: POST responde 202 y la saga sigue en Temporal; GET da el estado. */
@RestController
class ReservasController {

    record NuevaReserva(String eventoId, String clienteId, int importe, String tarjeta) { }

    private final WorkflowClient temporal;
    private final Map<String, Map<String, Object>> estados = new ConcurrentHashMap<>();

    ReservasController(WorkflowClient temporal) {
        this.temporal = temporal;
    }

    @PostMapping("/reservas")
    ResponseEntity<Map<String, Object>> crear(@RequestHeader("Idempotency-Key") String clave, @RequestBody NuevaReserva n) {
        String id = "R-" + clave;
        if (estados.containsKey(id)) return ResponseEntity.accepted().location(URI.create("/reservas/" + id)).body(estados.get(id));
        estados.put(id, Map.of("reservaId", id, "estado", "PENDIENTE"));
        // workflowId = reservaId: Temporal no arranca dos sagas para la misma reserva aunque el POST se repita.
        ReservaWorkflow saga = temporal.newWorkflowStub(ReservaWorkflow.class,
                WorkflowOptions.newBuilder().setTaskQueue("reservas").setWorkflowId("reserva-" + id).build());
        WorkflowClient.execute(saga::reservar, new Reserva(id, n.eventoId(), n.clienteId(), n.importe(), n.tarjeta(), false))
                .thenAccept(r -> estados.put(id, r.motivo() == null ? Map.of("reservaId", id, "estado", r.estado())
                        : Map.of("reservaId", id, "estado", r.estado(), "motivo", r.motivo())));
        return ResponseEntity.accepted().location(URI.create("/reservas/" + id)).body(estados.get(id));
    }

    @GetMapping("/reservas/{id}")
    ResponseEntity<Map<String, Object>> ver(@PathVariable String id) {
        var e = estados.get(id);
        return e == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(e);
    }
}
