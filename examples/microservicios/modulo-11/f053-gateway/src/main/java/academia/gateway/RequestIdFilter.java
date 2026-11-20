package academia.gateway;

import java.util.Optional;
import java.util.UUID;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/** Filtro global: toda petición sale del gateway con un X-Request-Id (el del cliente o uno nuevo). */
@Component
class RequestIdFilter implements GlobalFilter, Ordered {

    static final String CABECERA = "X-Request-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String id = Optional.ofNullable(exchange.getRequest().getHeaders().getFirst(CABECERA))
            .orElseGet(() -> UUID.randomUUID().toString());
        ServerHttpRequest peticion = exchange.getRequest().mutate()
            .headers(h -> h.set(CABECERA, id))
            .build();
        exchange.getResponse().getHeaders().set(CABECERA, id);     // el cliente también lo ve
        return chain.filter(exchange.mutate().request(peticion).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;                          // antes que cualquier otro filtro
    }
}
