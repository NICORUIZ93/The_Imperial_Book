package academia.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** GET /pedidos/disponibilidad/CAFE?cliente=resttemplate|webclient|feign|httpexchange */
@RestController
class DisponibilidadController {

    private final ClienteRestTemplate restTemplate;
    private final ClienteWebClient webClient;
    private final ClienteFeign feign;
    private final InventarioHttp httpExchange;

    DisponibilidadController(ClienteRestTemplate restTemplate, ClienteWebClient webClient, ClienteFeign feign,
            InventarioHttp httpExchange) {
        this.restTemplate = restTemplate;
        this.webClient = webClient;
        this.feign = feign;
        this.httpExchange = httpExchange;
    }

    @GetMapping("/pedidos/disponibilidad/{sku}")
    Existencia disponibilidad(@PathVariable String sku, @RequestParam(defaultValue = "resttemplate") String cliente) {
        return switch (cliente) {
            case "resttemplate" -> restTemplate.consultar(sku);
            // block() solo porque este controlador es MVC (bloqueante); en WebFlux devolverías el Mono.
            case "webclient" -> webClient.consultar(sku).block();
            case "feign" -> feign.consultar(sku);
            case "httpexchange" -> httpExchange.consultar(sku);
            default -> throw new IllegalArgumentException("cliente desconocido: " + cliente);
        };
    }
}
