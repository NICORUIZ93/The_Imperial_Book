package academia.rutaflow.graphql;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Controller
public class EntregaController {
    public record Entrega(String id, String estado, String conductorId) {}
    public record Conductor(String id, String nombre) {}
    private final Map<String, Entrega> datos = new ConcurrentHashMap<>();
    private final AtomicInteger lotes = new AtomicInteger();
    private final Sinks.Many<Entrega> cambios = Sinks.many().multicast().onBackpressureBuffer();
    public EntregaController() { reiniciar(); }
    public void reiniciar() {
        datos.clear();
        datos.put("ENV-1", new Entrega("ENV-1", "CREADA", "C-1"));
        datos.put("ENV-2", new Entrega("ENV-2", "CREADA", "C-1"));
        lotes.set(0);
    }
    public int consultasEnLote() { return lotes.get(); }
    @QueryMapping public Entrega entrega(@Argument String id) { return datos.get(id); }
    @QueryMapping public List<Entrega> entregas() {
        return datos.values().stream().sorted(Comparator.comparing(Entrega::id)).toList();
    }
    @BatchMapping(typeName = "Entrega", field = "conductor")
    public Map<Entrega, Conductor> conductores(List<Entrega> entregas) {
        lotes.incrementAndGet();
        Map<Entrega, Conductor> resultado = new HashMap<>();
        for (Entrega e : entregas) resultado.put(e, new Conductor(e.conductorId(), "Ana"));
        return resultado;
    }
    @MutationMapping public Entrega cambiarEstado(@Argument String id, @Argument String estado) {
        if (!"EN_RUTA".equals(estado)) throw new IllegalArgumentException("Estado no permitido");
        Entrega anterior = Objects.requireNonNull(datos.get(id), "Entrega inexistente");
        Entrega nueva = new Entrega(id, estado, anterior.conductorId());
        datos.put(id, nueva);
        cambios.tryEmitNext(nueva);
        return nueva;
    }
    @SubscriptionMapping public Flux<Entrega> cambio() { return cambios.asFlux(); }
}
