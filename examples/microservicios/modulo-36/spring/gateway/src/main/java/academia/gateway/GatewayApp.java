package academia.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import reactor.core.publisher.Mono;

/** Módulo 32 · F183 · Gateway: el límite se cuenta por API key (cabecera X-Api-Key), en Redis, para todas las réplicas. */
@SpringBootApplication
public class GatewayApp {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApp.class, args);
    }

    /** Clave del cubo de fichas: la API key. Sin cabecera -> clave vacía -> el filtro rechaza (deny-empty-key). */
    @Bean
    KeyResolver apiKeyResolver() {
        return exchange -> Mono.justOrEmpty(exchange.getRequest().getHeaders().getFirst("X-Api-Key"));
    }
}
