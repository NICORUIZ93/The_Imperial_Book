package academia.rest;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/** 2. WebClient: no bloqueante. Devuelve un Mono: la respuesta llega «después», sin ocupar un hilo esperando. */
@Component
public class ClienteWebClient {

    private final WebClient web;
    private final Duration timeout;

    public ClienteWebClient(WebClient.Builder builder, @Value("${inventario.url}") String url,
            @Value("${inventario.timeout}") Duration timeout) {
        this.web = builder.baseUrl(url).build();
        this.timeout = timeout;
    }

    public Mono<Existencia> consultar(String sku) {
        return web.get().uri("/inventario/{sku}", sku)
                .retrieve()
                .bodyToMono(Existencia.class)
                .timeout(timeout);
    }
}
