package academia.rutaflow.reactor;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class EntregaFlows {
    public Mono<String> buscar(String codigo) {
        return Mono.defer(() -> codigo.startsWith("RF-")
                ? Mono.just("Guía " + codigo)
                : Mono.empty());
    }

    public Flux<String> pendientes() {
        return Flux.fromIterable(List.of("RF-1200", "RF-1201", "RF-1202"));
    }

    public Mono<Integer> siguienteNumero(AtomicInteger contador) {
        return Mono.defer(() -> Mono.just(contador.incrementAndGet()));
    }
}
