package academia.presupuesto;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@RestController
class BffController {

    static final Duration RESERVA = Duration.ofMillis(50);
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build();
    private final String urlPedidos;
    private final Duration presupuesto;

    BffController(@Value("${pedidos.url}") String urlPedidos,
                  @Value("${bff.presupuesto:800ms}") Duration presupuesto) {
        this.urlPedidos = urlPedidos;
        this.presupuesto = presupuesto;
    }

    @GetMapping("/bff/pedidos/{id}")
    ResponseEntity<Map<String, Object>> pedido(@PathVariable long id,
            @RequestHeader(value = Deadline.CABECERA, required = false) Long cabecera) {
        Deadline deadline = Deadline.desde(cabecera, presupuesto);
        Duration restante = deadline.restante(RESERVA);
        if (restante.isNegative() || restante.isZero()) {               // ni lo intentes
            return ResponseEntity.status(504).body(Map.of("error", "SIN_PRESUPUESTO"));
        }
        // El timeout de ESTA llamada sale del presupuesto, no de una constante.
        var fabrica = new JdkClientHttpRequestFactory(http);
        fabrica.setReadTimeout(restante);
        RestClient rest = RestClient.builder().requestFactory(fabrica).build();
        try {
            String detalle = rest.get().uri(urlPedidos + "/pedidos/{id}", id)
                .header(Deadline.CABECERA, String.valueOf(deadline.paraElSiguiente(RESERVA).epochMs()))
                .retrieve().body(String.class);
            return ResponseEntity.ok(Map.of("pedido", id, "detalle", detalle));
        } catch (ResourceAccessException tiempoAgotado) {
            // Se acabó el presupuesto: respuesta degradada y marcada, a tiempo.
            return ResponseEntity.ok(Map.of("pedido", id, "degradado", true));
        }
    }
}
