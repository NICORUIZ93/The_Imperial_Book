package academia.observabilidad.metricas;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.Map;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PedidosController {

    private static final Set<String> CANALES = Set.of("web", "app");
    private final MeterRegistry registro;

    PedidosController(MeterRegistry registro) {
        this.registro = registro;
    }

    /** http.server.requests lo mide Spring solo (uri="/pedidos/{id}", la plantilla, no el id). */
    @GetMapping("/pedidos/{id}")
    Map<String, Object> pedido(@PathVariable long id, @RequestParam(defaultValue = "false") boolean lento)
            throws InterruptedException {
        Thread.sleep(lento ? 600 : 20);                     // ?lento=true simula una dependencia que tarda
        return Map.of("id", id, "estado", "confirmado");
    }

    /** Métrica de negocio: pedidos creados por canal (valores acotados: web, app u otro). */
    @PostMapping("/pedidos")
    ResponseEntity<Void> crear(@RequestParam String canal) {
        String etiqueta = CANALES.contains(canal) ? canal : "otro";   // nunca un valor libre como etiqueta
        Counter.builder("pedidos.creados")
            .description("Pedidos creados por canal")
            .tag("canal", etiqueta)
            .register(registro)
            .increment();
        return ResponseEntity.status(201).build();
    }
}
