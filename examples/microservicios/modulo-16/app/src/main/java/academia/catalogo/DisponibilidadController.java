package academia.catalogo;

import java.util.Map;

import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.LivenessState;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * SOLO PARA EL LABORATORIO: cambia a mano el estado que leen las probes de Kubernetes.
 * En una app real nadie expone esto: el estado lo cambia Spring (arranque, apagado) o tu código ante un fallo
 * interno irrecuperable (p. ej. un pool de hilos bloqueado).
 */
@RestController
class DisponibilidadController {

    private final ApplicationContext contexto;

    DisponibilidadController(ApplicationContext contexto) {
        this.contexto = contexto;
    }

    /** liveness -> DOWN (503): el kubelet reiniciará el contenedor tras failureThreshold fallos. */
    @PostMapping("/admin/liveness/romper")
    Map<String, String> romperLiveness() {
        AvailabilityChangeEvent.publish(contexto, LivenessState.BROKEN);
        return Map.of("liveness", "BROKEN");
    }

    /** readiness -> OUT_OF_SERVICE (503): el pod sale de los endpoints del Service, pero NO se reinicia. */
    @PostMapping("/admin/readiness/rechazar")
    Map<String, String> rechazarTrafico() {
        AvailabilityChangeEvent.publish(contexto, ReadinessState.REFUSING_TRAFFIC);
        return Map.of("readiness", "REFUSING_TRAFFIC");
    }

    @PostMapping("/admin/readiness/aceptar")
    Map<String, String> aceptarTrafico() {
        AvailabilityChangeEvent.publish(contexto, ReadinessState.ACCEPTING_TRAFFIC);
        return Map.of("readiness", "ACCEPTING_TRAFFIC");
    }
}
