package academia.observabilidad.trazas;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
class PedidosController {

    private static final Logger log = LoggerFactory.getLogger(PedidosController.class);
    private final RestClient inventario;
    private final ObservationRegistry observaciones;

    /** DESPUÉS: el RestClient sale del RestClient.Builder de Spring, que añade traceparent a cada llamada. */
    PedidosController(RestClient.Builder builder, ObservationRegistry observaciones,
                      @Value("${tienda.inventario.url}") String urlInventario) {
        this.inventario = builder.baseUrl(urlInventario).build();
        this.observaciones = observaciones;
    }

    @GetMapping("/pedidos/{id}")
    Map<String, Object> pedido(@PathVariable String id) {
        log.info("consultando pedido {}", id);                       // el log lleva [traceId-spanId]
        // Span propio para un paso interno; "pedido.id" es de alta cardinalidad: va a la traza, no a métricas.
        Map<?, ?> stock = Observation.createNotStarted("pedidos.reservar-stock", observaciones)
            .lowCardinalityKeyValue("operacion", "reserva")
            .highCardinalityKeyValue("pedido.id", id)
            .observe(() -> inventario.get().uri("/stock/{sku}", "CAFE-1").retrieve().body(Map.class));
        return Map.of("pedido", id, "estado", "confirmado", "stock", stock);
    }
}
